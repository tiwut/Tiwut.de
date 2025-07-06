// Importiere die benötigten Funktionen aus den Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, onChildAdded, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// DOM-Elemente
const roomSelection = document.getElementById('room-selection');
const transferArea = document.getElementById('transfer-area');
// ... (alle anderen DOM-Elemente wie zuvor) ...
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
    storageBucket: "peer-to-peer-a9775.appspot.com",
    messagingSenderId: "627503120696",
    appId: "1:627503120696:web:f00b2de669d0f8fa8641cd"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Die Datenbank-Instanz holen

// WebRTC-Variablen
let pc;
let dataChannel;
let roomId;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};


// --- Verbindungslogik (jetzt mit v9 Syntax) ---

createRoomBtn.onclick = async () => {
    roomId = roomIdInput.value.trim();
    if (!roomId) { alert('Bitte eine Raum-ID eingeben'); return; }
    
    pc = new RTCPeerConnection(configuration);
    dataChannel = pc.createDataChannel('fileTransfer');
    setupDataChannelEvents(dataChannel);

    const roomRef = ref(db, `rooms/${roomId}`); // v9 Syntax: ref(db, path)
    const iceCandidatesRef = ref(db, `rooms/${roomId}/iceCandidates`);

    pc.onicecandidate = event => {
        if (event.candidate) {
            push(iceCandidatesRef, event.candidate.toJSON()); // v9 Syntax: push(ref, data)
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    await set(roomRef, { offer: { type: offer.type, sdp: offer.sdp } }); // v9 Syntax: set(ref, data)

    onValue(roomRef, snapshot => { // v9 Syntax: onValue(ref, callback)
        const data = snapshot.val();
        if (data?.answer && !pc.currentRemoteDescription) {
            pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    });
    
    listenForIceCandidates(iceCandidatesRef);
    showTransferArea();
};

joinRoomBtn.onclick = async () => {
    roomId = roomIdInput.value.trim();
    if (!roomId) { alert('Bitte eine Raum-ID eingeben'); return; }
    
    const roomRef = ref(db, `rooms/${roomId}`);
    const iceCandidatesRef = ref(db, `rooms/${roomId}/iceCandidates`);
    const roomSnapshot = await get(roomRef); // v9 Syntax: get(ref) für einmaliges Lesen
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

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await update(roomRef, { answer: { type: answer.type, sdp: answer.sdp } }); // v9 Syntax: update(ref, data)

    listenForIceCandidates(iceCandidatesRef);
    showTransferArea();
};

function listenForIceCandidates(iceCandidatesRef) {
    onChildAdded(iceCandidatesRef, snapshot => { // v9 Syntax: onChildAdded(ref, callback)
        if (snapshot.exists()) {
            pc.addIceCandidate(new RTCIceCandidate(snapshot.val()));
        }
    });
}


// --- Datenübertragungslogik (unverändert, da sie reines WebRTC ist) ---
// (Hier wird der exakt gleiche Code wie in der vorherigen Antwort eingefügt,
// da dieser Teil nichts mit Firebase zu tun hat. Ich kopiere ihn hier zur Vollständigkeit.)

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
        // Raum in Firebase aufräumen
        remove(ref(db, `rooms/${roomId}`)); // v9 Syntax: remove(ref)
    };

    channel.onmessage = event => {
        const { data } = event;
        try {
            const metadata = JSON.parse(data);
            fileToReceive = metadata;
            receiveBuffer = [];
            receivedSize = 0;
            console.log('Empfange Datei:', metadata.name);
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
            dataChannel.send(event.target.result);
            offset += event.target.result.byteLength;
            progressBar.value = Math.round((offset / file.size) * 100);
            if (offset < file.size) {
                readSlice(offset);
            } else {
                console.log('Datei komplett gesendet');
                progressBar.classList.add('hidden');
                progressBar.value = 0;
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