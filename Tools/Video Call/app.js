import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, onChildAdded, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCuZhLP_pFgmM4w4W3vThPqHro9vGaehiw",
    authDomain: "video-call-app-3d298.firebaseapp.com",
    projectId: "video-call-app-3d298",
    // KORREKTUR 1: Die spezifische Datenbank-URL wurde hinzugefügt
    databaseURL: "https://video-call-app-3d298-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "video-call-app-3d298.firebasestorage.app",
    messagingSenderId: "116865723028",
    appId: "1:116865723028:web:cba97e2fc7569c52d42281"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const getElement = (id) => document.getElementById(id);
const dom = {
    roomSelection: getElement('room-selection'),
    callArea: getElement('call-area'),
    roomIdInput: getElement('roomIdInput'),
    createRoomBtn: getElement('createRoomBtn'),
    joinRoomBtn: getElement('joinRoomBtn'),
    hangUpBtn: getElement('hangUpBtn'),
    localVideo: getElement('localVideo'),
    remoteVideo: getElement('remoteVideo'),
};

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pc, localStream, remoteStream, roomId;
let iceCandidateQueue = []; // KORREKTUR 2: Warteschlange für ICE-Kandidaten

const showCallArea = () => {
    dom.roomSelection.classList.add('hidden');
    dom.callArea.classList.remove('hidden');
};

const resetCall = () => {
    if (pc) {
        pc.close();
        pc = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    dom.localVideo.srcObject = null;
    dom.remoteVideo.srcObject = null;
    if (roomId) remove(ref(db, `rooms/${roomId}`));
    
    dom.callArea.classList.add('hidden');
    dom.roomSelection.classList.remove('hidden');
    iceCandidateQueue = [];
};

const setupPeerConnection = async () => {
    pc = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    const iceCandidatesRef = ref(db, `rooms/${roomId}/iceCandidates`);
    pc.onicecandidate = event => {
        if (event.candidate) {
            push(iceCandidatesRef, event.candidate.toJSON());
        }
    };

    pc.ontrack = event => {
        remoteStream = event.streams[0];
        dom.remoteVideo.srcObject = remoteStream;
    };
    
    // KORREKTUR 2: Logik zum Hinzufügen von Kandidaten zur Warteschlange
    onChildAdded(iceCandidatesRef, snapshot => {
        if (snapshot.exists()) {
            const candidate = new RTCIceCandidate(snapshot.val());
            if (pc.remoteDescription) {
                pc.addIceCandidate(candidate);
            } else {
                iceCandidateQueue.push(candidate);
            }
        }
    });
};

dom.createRoomBtn.onclick = async () => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert("Please enter a room ID"); return; }
    iceCandidateQueue = []; // Warteschlange zurücksetzen

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    dom.localVideo.srcObject = localStream;

    showCallArea();

    await setupPeerConnection();
    
    const roomRef = ref(db, `rooms/${roomId}`);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await set(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });
    
    onValue(roomRef, async (snapshot) => {
        const data = snapshot.val();
        if (data?.answer && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            
            // KORREKTUR 2: Warteschlange abarbeiten, nachdem die Antwort gesetzt wurde
            iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
            iceCandidateQueue = [];
        }
    }, { onlyOnce: false });
};

dom.joinRoomBtn.onclick = async () => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert("Please enter a room ID"); return; }
    iceCandidateQueue = []; // Warteschlange zurücksetzen
    
    const roomRef = ref(db, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists() || !roomSnapshot.val().offer) {
        alert("Room not found or offer is missing!");
        return;
    }
    
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    dom.localVideo.srcObject = localStream;
    
    showCallArea();

    await setupPeerConnection();
    
    await pc.setRemoteDescription(new RTCSessionDescription(roomSnapshot.val().offer));

    // KORREKTUR 2: Warteschlange abarbeiten, nachdem das Angebot gesetzt wurde
    iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
    iceCandidateQueue = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await update(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });
};

dom.hangUpBtn.onclick = () => {
    resetCall();
};

window.addEventListener('beforeunload', () => {
    if (pc) {
        resetCall();
    }
});