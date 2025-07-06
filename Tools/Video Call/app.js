import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, onChildAdded, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCuZhLP_pFgmM4w4W3vThPqHro9vGaehiw",
    authDomain: "video-call-app-3d298.firebaseapp.com",
    projectId: "video-call-app-3d298",
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
    toggleAudioBtn: getElement('toggleAudioBtn'),
    toggleVideoBtn: getElement('toggleVideoBtn'),
    shareScreenBtn: getElement('shareScreenBtn'),
    flipCameraBtn: getElement('flipCameraBtn')
};

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pc, localStream, remoteStream, roomId, originalVideoTrack;
let isScreenSharing = false;
let iceCandidateQueue = [];

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
    isScreenSharing = false;
    dom.shareScreenBtn.classList.remove('active');
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

const startLocalStream = async (videoConstraints = true) => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
    originalVideoTrack = localStream.getVideoTracks()[0];
    dom.localVideo.srcObject = localStream;
};

const replaceVideoTrack = async (newTrack) => {
    const sender = pc.getSenders().find(s => s.track.kind === 'video');
    if (sender) {
        await sender.replaceTrack(newTrack);
    }
};

dom.createRoomBtn.onclick = async () => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert("Please enter a room ID"); return; }
    iceCandidateQueue = [];

    await startLocalStream();
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
            iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
            iceCandidateQueue = [];
        }
    });
};

dom.joinRoomBtn.onclick = async () => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert("Please enter a room ID"); return; }
    iceCandidateQueue = [];
    
    const roomRef = ref(db, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists() || !roomSnapshot.val().offer) {
        alert("Room not found or offer is missing!");
        return;
    }
    
    await startLocalStream();
    showCallArea();

    await setupPeerConnection();
    
    await pc.setRemoteDescription(new RTCSessionDescription(roomSnapshot.val().offer));
    iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
    iceCandidateQueue = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await update(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });
};

dom.toggleAudioBtn.onclick = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    dom.toggleAudioBtn.classList.toggle('toggled-off', !audioTrack.enabled);
};

dom.toggleVideoBtn.onclick = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    dom.toggleVideoBtn.classList.toggle('toggled-off', !videoTrack.enabled);
};

dom.hangUpBtn.onclick = () => resetCall();

dom.shareScreenBtn.onclick = async () => {
    if (isScreenSharing) {
        await replaceVideoTrack(originalVideoTrack);
        localStream.getTracks().forEach(t => { if(t.kind === 'video' && t.id !== originalVideoTrack.id) t.stop(); });
        localStream.removeTrack(localStream.getVideoTracks()[0]);
        localStream.addTrack(originalVideoTrack);
        dom.localVideo.srcObject = localStream;
        isScreenSharing = false;
        dom.shareScreenBtn.classList.remove('active');
    } else {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            
            await replaceVideoTrack(screenTrack);
            dom.localVideo.srcObject = screenStream;
            isScreenSharing = true;
            dom.shareScreenBtn.classList.add('active');

            screenTrack.onended = () => dom.shareScreenBtn.click();
        } catch (err) {
            console.error("Screen sharing failed:", err);
        }
    }
};

dom.flipCameraBtn.onclick = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const currentDeviceId = localStream.getVideoTracks()[0].getSettings().deviceId;
    const currentDeviceIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
    const nextDevice = videoDevices[(currentDeviceIndex + 1) % videoDevices.length];
    
    localStream.getTracks().forEach(t => t.stop());
    
    await startLocalStream({ deviceId: { exact: nextDevice.deviceId } });
    await replaceVideoTrack(localStream.getVideoTracks()[0]);
};

const checkDeviceSupport = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
            dom.flipCameraBtn.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Could not enumerate devices:", err);
    }
};

window.addEventListener('beforeunload', () => {
    if (pc) {
        resetCall();
    }
});

checkDeviceSupport();