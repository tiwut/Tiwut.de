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

const translations = {
    en: {
        privacyTitle: "Privacy Notice",
        privacyText1: "This is a peer-to-peer (P2P) video call service. When you use this service, you establish a direct, encrypted connection to the other user's browser.",
        privacyText2: "Your video and audio are <strong>not</strong> sent to a central server. They are streamed directly to the other participant. For the connection to be established, temporary and anonymous connection data is exchanged via a signaling server (Firebase).",
        privacyText3: "By clicking \"Accept\", you agree to this process and grant access to your camera and microphone for the call.",
        accept: "Accept & Grant Access", mainTitle: "Video Call", roomDescription: "Enter a room name to start or join a call.", createRoom: "Create Room", joinRoom: "Join Room", roomPlaceholder: "Enter Room ID...",
        toggleAudio: "Toggle Audio", toggleVideo: "Toggle Video", shareScreen: "Share Screen", flipCamera: "Flip Camera", hangUp: "Hang Up",
        roomNotFound: "Room not found!", enterRoomId: "Please enter a Room ID.",
    },
    de: {
        privacyTitle: "Datenschutzhinweis",
        privacyText1: "Dies ist ein Peer-to-Peer (P2P) Videoanrufdienst. Bei der Nutzung wird eine direkte, verschlüsselte Verbindung zum Browser des anderen Benutzers hergestellt.",
        privacyText2: "Ihre Video- und Audiodaten werden <strong>nicht</strong> an einen zentralen Server gesendet. Sie werden direkt zum anderen Teilnehmer gestreamt. Um die Verbindung herzustellen, werden temporäre, anonyme Verbindungsdaten über einen Signalisierungsserver (Firebase) ausgetauscht.",
        privacyText3: "Mit Klick auf \"Akzeptieren\" stimmen Sie diesem Vorgang zu und erteilen für den Anruf Zugriff auf Ihre Kamera und Ihr Mikrofon.",
        accept: "Akzeptieren & Zugriff erlauben", mainTitle: "Videoanruf", roomDescription: "Geben Sie einen Raumnamen ein, um einen Anruf zu starten oder beizutreten.", createRoom: "Raum erstellen", joinRoom: "Raum beitreten", roomPlaceholder: "Raum-ID eingeben...",
        toggleAudio: "Audio umschalten", toggleVideo: "Video umschalten", shareScreen: "Bildschirm teilen", flipCamera: "Kamera drehen", hangUp: "Auflegen",
        roomNotFound: "Raum nicht gefunden!", enterRoomId: "Bitte eine Raum-ID eingeben.",
    },
    es: {
        privacyTitle: "Aviso de Privacidad",
        privacyText1: "Este es un servicio de videollamada peer-to-peer (P2P). Al usar este servicio, estableces una conexión directa y encriptada con el navegador del otro usuario.",
        privacyText2: "Tus datos de video y audio <strong>no</strong> se envían a un servidor central. Se transmiten directamente al otro participante. Para establecer la conexión, se intercambian datos de conexión temporales y anónimos a través de un servidor de señalización (Firebase).",
        privacyText3: "Al hacer clic en \"Aceptar\", aceptas este proceso y otorgas acceso a tu cámara y micrófono para la llamada.",
        accept: "Aceptar y dar acceso", mainTitle: "Videollamada", roomDescription: "Introduce un nombre de sala para iniciar o unirte a una llamada.", createRoom: "Crear Sala", joinRoom: "Unirse a Sala", roomPlaceholder: "Introduce un ID de sala...",
        toggleAudio: "Activar/Desactivar Audio", toggleVideo: "Activar/Desactivar Video", shareScreen: "Compartir Pantalla", flipCamera: "Girar Cámara", hangUp: "Colgar",
        roomNotFound: "¡Sala no encontrada!", enterRoomId: "Por favor, introduce un ID de sala.",
    }
};

let currentLang = 'en';

const getElement = (id) => document.getElementById(id);

const dom = {
    privacyModal: getElement('privacy-modal'),
    acceptPrivacyBtn: getElement('accept-privacy-btn'),
    appContainer: getElement('app-container'),
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
    flipCameraBtn: getElement('flipCameraBtn'),
    localVideoContainer: getElement('localVideoContainer'),
    minimizeLocalVideoBtn: getElement('minimizeLocalVideoBtn'),
};

const updateUIText = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) el.innerHTML = translations[lang][key];
    });
    document.querySelectorAll('[data-placeholder]').forEach(el => {
        const key = el.getAttribute('data-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.querySelectorAll('[data-tooltip-lang]').forEach(el => {
        const key = el.getAttribute('data-tooltip-lang');
        if (translations[lang][key]) el.setAttribute('data-tooltip-lang', translations[lang][key]);
    });
};

const setupLanguage = () => {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    let initialLang = 'en';
    if (savedLang && translations[savedLang]) initialLang = savedLang;
    else if (translations[browserLang]) initialLang = browserLang;
    updateUIText(initialLang);
    dom.languageSwitcher.querySelector(`[data-lang-code="${initialLang}"]`).classList.add('active');
    dom.languageSwitcher.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            const langCode = e.target.getAttribute('data-lang-code');
            if (langCode) {
                updateUIText(langCode);
                localStorage.setItem('language', langCode);
                dom.languageSwitcher.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
            }
        }
    });
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pc, localStream, remoteStream, roomId, originalVideoTrack;
let isScreenSharing = false;
let iceCandidateQueue = [];

const showCallArea = () => {
    dom.roomSelection.classList.add('hidden');
    dom.appContainer.querySelector('header').classList.add('hidden');
    dom.callArea.classList.remove('hidden');
};

const resetCall = () => {
    if (pc) { pc.close(); pc = null; }
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    dom.localVideo.srcObject = null;
    dom.remoteVideo.srcObject = null;
    if (roomId) remove(ref(db, `rooms/${roomId}`));
    
    dom.callArea.classList.add('hidden');
    dom.roomSelection.classList.remove('hidden');
    dom.appContainer.querySelector('header').classList.remove('hidden');
    iceCandidateQueue = [];
    isScreenSharing = false;
    dom.shareScreenBtn.classList.remove('active');
    dom.remoteVideo.classList.remove('screen-share-active');
};

const setupPeerConnection = async () => {
    pc = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    const iceCandidatesRef = ref(db, `rooms/${roomId}/iceCandidates`);
    pc.onicecandidate = event => {
        if (event.candidate) push(iceCandidatesRef, event.candidate.toJSON());
    };
    pc.ontrack = event => {
        dom.remoteVideo.srcObject = event.streams[0];
    };
    onChildAdded(iceCandidatesRef, snapshot => {
        if (snapshot.exists()) {
            const candidate = new RTCIceCandidate(snapshot.val());
            if (pc.remoteDescription) pc.addIceCandidate(candidate);
            else iceCandidateQueue.push(candidate);
        }
    });
};

const startLocalStream = async (videoConstraints = true) => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    localStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
    originalVideoTrack = localStream.getVideoTracks()[0];
    dom.localVideo.srcObject = localStream;
};

const replaceVideoTrack = async (newTrack) => {
    const sender = pc.getSenders().find(s => s.track.kind === 'video');
    if (sender) await sender.replaceTrack(newTrack);
};

const handleCallLogic = async (isCreator) => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert(translations[currentLang].enterRoomId); return; }
    iceCandidateQueue = [];
    
    if (isCreator) {
        await startLocalStream();
        showCallArea();
        await setupPeerConnection();
        const roomRef = ref(db, `rooms/${roomId}`);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await set(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });
        onValue(roomRef, async snapshot => {
            const data = snapshot.val();
            if (data?.answer && !pc.currentRemoteDescription) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                iceCandidateQueue.forEach(c => pc.addIceCandidate(c));
                iceCandidateQueue = [];
            }
        });
    } else {
        const roomRef = ref(db, `rooms/${roomId}`);
        const roomSnapshot = await get(roomRef);
        if (!roomSnapshot.exists() || !roomSnapshot.val().offer) {
            alert(translations[currentLang].roomNotFound); return;
        }
        await startLocalStream();
        showCallArea();
        await setupPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(roomSnapshot.val().offer));
        iceCandidateQueue.forEach(c => pc.addIceCandidate(c));
        iceCandidateQueue = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await update(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });
    }
};

dom.createRoomBtn.onclick = () => handleCallLogic(true);
dom.joinRoomBtn.onclick = () => handleCallLogic(false);

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

dom.hangUpBtn.onclick = resetCall;

dom.shareScreenBtn.onclick = async () => {
    if (isScreenSharing) {
        await replaceVideoTrack(originalVideoTrack);
        dom.localVideo.srcObject = localStream;
        isScreenSharing = false;
        dom.shareScreenBtn.classList.remove('active');
        dom.remoteVideo.classList.remove('screen-share-active');
    } else {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            await replaceVideoTrack(screenTrack);
            dom.localVideo.srcObject = screenStream;
            isScreenSharing = true;
            dom.shareScreenBtn.classList.add('active');
            dom.remoteVideo.classList.add('screen-share-active');
            screenTrack.onended = () => dom.shareScreenBtn.click();
        } catch (err) {
            console.error("Screen sharing failed:", err);
        }
    }
};

dom.flipCameraBtn.onclick = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    if (videoDevices.length < 2) return;
    const currentDeviceId = localStream.getVideoTracks()[0].getSettings().deviceId;
    const currentDeviceIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
    const nextDevice = videoDevices[(currentDeviceIndex + 1) % videoDevices.length];
    await startLocalStream({ deviceId: { exact: nextDevice.deviceId } });
    await replaceVideoTrack(originalVideoTrack);
};

dom.minimizeLocalVideoBtn.onclick = () => {
    dom.localVideoContainer.classList.toggle('minimized');
};

const checkDeviceSupport = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (devices.filter(d => d.kind === 'videoinput').length > 1) {
            dom.flipCameraBtn.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Could not enumerate devices:", err);
    }
};

const startApp = () => {
    dom.privacyModal.classList.add('hidden');
    dom.appContainer.classList.remove('hidden');
    checkDeviceSupport();
};

document.addEventListener('DOMContentLoaded', () => {
    setupLanguage();
    dom.acceptPrivacyBtn.addEventListener('click', () => {
        localStorage.setItem('privacyAccepted', 'true');
        startApp();
    });
    if (localStorage.getItem('privacyAccepted') === 'true') startApp();
    else dom.privacyModal.classList.remove('hidden');
});

window.addEventListener('beforeunload', () => {
    if (pc) resetCall();
});