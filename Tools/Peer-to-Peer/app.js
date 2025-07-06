// Importiere die benötigten Funktionen aus den Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, onChildAdded, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// DOM-Elemente holen
// ... (alle getElementById Aufrufe bleiben gleich) ...
const roomSelection = document.getElementById('room-selection');
const transferArea = document.getElementById('transfer-area');
const roomIdInput = document.getElementById('roomIdInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomIdDisplay = document.getElementById('roomIdDisplay');
const statusDiv = document.getElementById('status');
const fileSender = document.getElementById('file-sender');
const fileInput = document.getElementById('fileInput');
const sendBtn = document.getElementById('sendBtn');
const progressBar = document.getElementById('progress-bar');
const downloadList = document.getElementById('download-list');


// Deine Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyC0KcQwXCp8-QsYQdNqX_NBOhpLT17x1A0", // BITTE NACH DEM TEST NEU GENERIEREN!
    authDomain: "peer-to-peer-a9775.firebaseapp.com",
    projectId: "peer-to-peer-a9775",
    databaseURL: "https://peer-to-peer-a9775-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "peer-to-peer-a9775.appspot.com",
    messagingSenderId: "627503120696",
    appId: "1:627503120696:web:f00b2de669d0f8fa8641cd"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// WebRTC-Variablen
let pc;
let dataChannel;
let roomId;
let iceCandidateQueue = []; // NEU: Warteschlange für zu frühe ICE-Kandidaten

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// --- Verbindungslogik ---
createRoomBtn.onclick = async () => {
    // ... (Anfang bleibt gleich)
    roomId = roomIdInput.value.trim();
    if (!roomId) { alert('Bitte eine Raum-ID eingeben'); return; }
    
    iceCandidateQueue = []; // NEU: Warteschlange bei jedem neuen Versuch leeren
    pc = new RTCPeerConnection(configuration);
    dataChannel = pc.createDataChannel('fileTransfer');
    setupDataChannelEvents(dataChannel);

    const roomRef = ref(db, `rooms/${roomId}`);
    const iceCandidatesRef = ref(db, `rooms/${roomId}/iceCandidates`);

    pc.onicecandidate = event => {
        if (event.candidate) {
            push(iceCandidatesRef, event.candidate.toJSON());
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    await set(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });

    onValue(roomRef, async (snapshot) => { // MODIFIZIERT: Funktion als async markiert
        const data = snapshot.val();
        if (data?.answer && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer)); // MODIFIZIERT: await hinzugefügt
            
            // NEU: Jetzt die Warteschlange abarbeiten
            iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
            iceCandidateQueue = []; // Warteschlange leeren
        }
    });
    
    listenForIceCandidates(iceCandidatesRef);
    showTransferArea();
};

joinRoomBtn.onclick = async () => {
    // ... (Anfang bleibt gleich)
    roomId = roomIdInput.value.trim();
    if (!roomId) { alert('Bitte eine Raum-ID eingeben'); return; }

    iceCandidateQueue = []; // NEU: Warteschlange bei jedem neuen Versuch leeren
    const roomRef = ref(db, `rooms/${roomId}`);
    const iceCandidatesRef = ref(db, `rooms/${roomId}/iceCandidates`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
        alert('Raum nicht gefunden!');
        return;
    }

    pc = new RTCPeerConnection(configuration);
    
    pc.onicecandidate = event => {
        if (event.candidate) {
            push(iceCandidatesRef, event.candidate.toJSON());
        }
    };
    
    pc.ondatachannel = event => {
        dataChannel = event.channel;
        setupDataChannelEvents(dataChannel);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(roomSnapshot.val().offer));

    // NEU: Jetzt die Warteschlange abarbeiten, die sich währenddessen gefüllt haben könnte
    iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
    iceCandidateQueue = [];
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await update(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });

    listenForIceCandidates(iceCandidatesRef);
    showTransferArea();
};

// MODIFIZIERT: Diese Funktion nutzt jetzt die Warteschlange
function listenForIceCandidates(iceCandidatesRef) {
    onChildAdded(iceCandidatesRef, snapshot => {
        if (snapshot.exists()) {
            const candidate = new RTCIceCandidate(snapshot.val());
            
            // Wenn die remoteDescription schon da ist, direkt hinzufügen.
            // Sonst in die Warteschlange packen.
            if (pc.remoteDescription) {
                pc.addIceCandidate(candidate);
            } else {
                iceCandidateQueue.push(candidate);
            }
        }
    });
}


// --- Der Rest des Codes (Datenübertragung, UI-Helfer) bleibt unverändert ---

// --- Datenübertragungslogik ---
let receiveBuffer = [];
let receivedSize = 0;
let fileToReceive = null;
function setupDataChannelEvents(channel) {
    channel.onopen = () => {
        statusDiv.textContent = 'Verbunden! Bereit für die Dateiübertragung.';
        statusDiv.style.color = '#27ae60';
        fileSender.classList.remove('hidden');
    };
    channel.onclose = () => {
        statusDiv.textContent = 'Verbindung geschlossen.';
        statusDiv.style.color = '#c0392b';
        remove(ref(db, `rooms/${roomId}`));
    };
    channel.onmessage = event => {
        const { data } = event;
        try {
            const metadata = JSON.parse(data);
            fileToReceive = metadata;
            receiveBuffer = [];
            receivedSize = 0;
            return;
        } catch (err) {
            receiveBuffer.push(data);
            receivedSize += data.byteLength;
            const progress = Math.round((receivedSize / fileToReceive.size) * 100);
            statusDiv.textContent = `Empfange "${fileToReceive.name}"... ${progress}%`;
            if (receivedSize === fileToReceive.size) {
                const receivedFile = new Blob(receiveBuffer);
                receiveBuffer = [];
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(receivedFile);
                downloadLink.download = fileToReceive.name;
                downloadLink.textContent = `${fileToReceive.name} (${(fileToReceive.size / 1024 / 1024).toFixed(2)} MB)`;
                const li = document.createElement('li');
                li.appendChild(downloadLink);
                downloadList.prepend(li);
                statusDiv.textContent = 'Datei empfangen! Bereit für die nächste.';
            }
        }
    };
}
sendBtn.onclick = () => {
    const file = fileInput.files[0];
    if (!file) return;
    dataChannel.send(JSON.stringify({ name: file.name, type: file.type, size: file.size }));
    const chunkSize = 16384;
    let offset = 0;
    progressBar.classList.remove('hidden');
    const readSlice = o => {
        const slice = file.slice(offset, o + chunkSize);
        const reader = new FileReader();
        reader.onload = event => {
            if (dataChannel.readyState === 'open') {
                dataChannel.send(event.target.result);
                offset += event.target.result.byteLength;
                progressBar.value = Math.round((offset / file.size) * 100);
                if (offset < file.size) {
                    readSlice(offset);
                } else {
                    progressBar.classList.add('hidden');
                    progressBar.value = 0;
                }
            }
        };
        reader.readAsArrayBuffer(slice);
    };
    readSlice(0);
};
// --- UI-Helfer ---
function showTransferArea() {
    roomIdDisplay.textContent = roomId;
    roomSelection.classList.add('hidden');
    transferArea.classList.remove('hidden');
}