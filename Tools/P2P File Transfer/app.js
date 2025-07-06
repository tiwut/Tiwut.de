import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, remove, onChildAdded, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0KcQwXCp8-QsYQdNqX_NBOhpLT17x1A0", 
    authDomain: "peer-to-peer-a9775.firebaseapp.com",
    projectId: "peer-to-peer-a9775",
    databaseURL: "https://peer-to-peer-a9775-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "peer-to-peer-a9775.appspot.com",
    messagingSenderId: "627503120696",
    appId: "1:627503120696:web:f00b2de669d0f8fa8641cd"
};

const translations = {
    en: {
        privacyTitle: "Privacy Notice",
        privacyText1: "This is a peer-to-peer (P2P) file transfer service. When you use this service, you establish a direct, encrypted connection to the other user's browser.",
        privacyText2: "Your files are <strong>not</strong> uploaded to a central server. They are sent directly from your device to the other device. For the connection to be established, temporary and anonymous connection data is exchanged via a signaling server (Firebase). This data is deleted once the connection is closed.",
        privacyText3: "By clicking \"Accept\", you agree to this process.",
        accept: "Accept",
        mainTitle: "P2P File Transfer",
        createRoom: "Create Room",
        joinRoom: "Join Room",
        room: "Room",
        waiting: "Waiting for partner...",
        connected: "Connected! Ready for file transfer.",
        connectionClosed: "Connection closed.",
        selectFile: "Select a file",
        receivedFiles: "Received Files:",
        roomPlaceholder: "Enter a Room ID...",
        roomNotFound: "Room not found!",
        enterRoomId: "Please enter a Room ID.",
        sendingFile: "Sending \"{filename}\"... {progress}%",
        receivingFile: "Receiving \"{filename}\"... {progress}%",
        fileSent: "File sent successfully! Ready for the next.",
        fileReceived: "File received! Ready for the next."
    },
    de: {
        privacyTitle: "Datenschutzhinweis",
        privacyText1: "Dies ist ein Peer-to-Peer (P2P) Dateiübertragungsdienst. Bei der Nutzung wird eine direkte, verschlüsselte Verbindung zum Browser des anderen Benutzers hergestellt.",
        privacyText2: "Ihre Dateien werden <strong>nicht</strong> auf einen zentralen Server hochgeladen. Sie werden direkt von Ihrem Gerät zum anderen Gerät gesendet. Um die Verbindung herzustellen, werden temporäre und anonyme Verbindungsdaten über einen Signalisierungsserver (Firebase) ausgetauscht. Diese Daten werden nach Beendigung der Verbindung gelöscht.",
        privacyText3: "Indem Sie auf \"Akzeptieren\" klicken, stimmen Sie diesem Prozess zu.",
        accept: "Akzeptieren",
        mainTitle: "P2P Dateiübertragung",
        createRoom: "Raum erstellen",
        joinRoom: "Raum beitreten",
        room: "Raum",
        waiting: "Warte auf Partner...",
        connected: "Verbunden! Bereit für die Dateiübertragung.",
        connectionClosed: "Verbindung geschlossen.",
        selectFile: "Datei auswählen",
        receivedFiles: "Empfangene Dateien:",
        roomPlaceholder: "Raum-ID eingeben...",
        roomNotFound: "Raum nicht gefunden!",
        enterRoomId: "Bitte eine Raum-ID eingeben.",
        sendingFile: "Sende \"{filename}\"... {progress}%",
        receivingFile: "Empfange \"{filename}\"... {progress}%",
        fileSent: "Datei erfolgreich gesendet! Bereit für die nächste.",
        fileReceived: "Datei empfangen! Bereit für die nächste."
    },
    es: {
        privacyTitle: "Aviso de Privacidad",
        privacyText1: "Este es un servicio de transferencia de archivos peer-to-peer (P2P). Al usar este servicio, estableces una conexión directa y encriptada con el navegador del otro usuario.",
        privacyText2: "Tus archivos <strong>no</strong> se suben a un servidor central. Se envían directamente desde tu dispositivo al otro. Para establecer la conexión, se intercambian datos de conexión temporales y anónimos a través de un servidor de señalización (Firebase). Estos datos se eliminan una vez que se cierra la conexión.",
        privacyText3: "Al hacer clic en \"Aceptar\", aceptas este proceso.",
        accept: "Aceptar",
        mainTitle: "Transferencia de Archivos P2P",
        createRoom: "Crear Sala",
        joinRoom: "Unirse a Sala",
        room: "Sala",
        waiting: "Esperando al compañero...",
        connected: "¡Conectado! Listo para la transferencia de archivos.",
        connectionClosed: "Conexión cerrada.",
        selectFile: "Seleccionar un archivo",
        receivedFiles: "Archivos Recibidos:",
        roomPlaceholder: "Introduce un ID de sala...",
        roomNotFound: "¡Sala no encontrada!",
        enterRoomId: "Por favor, introduce un ID de sala.",
        sendingFile: "Enviando \"{filename}\"... {progress}%",
        receivingFile: "Recibiendo \"{filename}\"... {progress}%",
        fileSent: "¡Archivo enviado con éxito! Listo para el siguiente.",
        fileReceived: "¡Archivo recibido! Listo para el siguiente."
    }
};

let currentLang = 'en';

const getElement = (id) => document.getElementById(id);

const dom = {
    privacyModal: getElement('privacy-modal'),
    acceptPrivacyBtn: getElement('accept-privacy-btn'),
    appContainer: getElement('app-container'),
    roomSelection: getElement('room-selection'),
    transferArea: getElement('transfer-area'),
    roomIdInput: getElement('roomIdInput'),
    createRoomBtn: getElement('createRoomBtn'),
    joinRoomBtn: getElement('joinRoomBtn'),
    roomIdDisplay: getElement('roomIdDisplay'),
    status: getElement('status'),
    fileSender: getElement('file-sender'),
    fileInput: getElement('fileInput'),
    fileNameDisplay: getElement('file-name-display'),
    progressContainer: getElement('progress-container'),
    progressBar: getElement('progress-bar'),
    progressText: getElement('progress-text'),
    downloadList: getElement('download-list'),
    themeToggle: getElement('theme-toggle'),
    languageSwitcher: document.querySelector('.language-switcher')
};

const updateUIText = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-placeholder]').forEach(el => {
        const key = el.getAttribute('data-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
};

const getStatusText = (key, replacements = {}) => {
    let text = translations[currentLang][key] || key;
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
};

const setupTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        dom.themeToggle.checked = true;
    } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        dom.themeToggle.checked = false;
    }

    dom.themeToggle.addEventListener('change', () => {
        if (dom.themeToggle.checked) {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
};

const setupLanguage = () => {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    
    let initialLang = 'en';
    if (savedLang && translations[savedLang]) {
        initialLang = savedLang;
    } else if (translations[browserLang]) {
        initialLang = browserLang;
    }
    
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
let pc, dataChannel, roomId, iceCandidateQueue = [];
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const showTransferArea = () => {
    dom.roomIdDisplay.textContent = roomId;
    dom.roomSelection.classList.add('hidden');
    dom.transferArea.classList.remove('hidden');
};

const resetUI = () => {
    dom.roomSelection.classList.remove('hidden');
    dom.transferArea.classList.add('hidden');
    dom.downloadList.innerHTML = '';
    dom.status.textContent = getStatusText('waiting');
    dom.progressContainer.classList.add('hidden');
    dom.fileSender.classList.add('hidden');
    dom.fileNameDisplay.textContent = '';
    dom.fileInput.value = '';
};

const setupDataChannelEvents = (channel) => {
    channel.onopen = () => {
        dom.status.textContent = getStatusText('connected');
        dom.fileSender.classList.remove('hidden');
    };
    channel.onclose = () => {
        dom.status.textContent = getStatusText('connectionClosed');
        if (roomId) remove(ref(db, `rooms/${roomId}`));
        setTimeout(resetUI, 3000);
    };

    let fileWriter, receivedSize = 0, fileToReceive = null;
    channel.onmessage = async event => {
        const { data } = event;
        try {
            const metadata = JSON.parse(data);
            fileToReceive = metadata;
            receivedSize = 0;
            const fileStream = streamSaver.createWriteStream(fileToReceive.name, {
                size: fileToReceive.size
            });
            fileWriter = fileStream.getWriter();
            dom.progressContainer.classList.remove('hidden');
        } catch (err) {
            if (!fileWriter) {
                console.error("Received file chunk before metadata.");
                return;
            }
            await fileWriter.write(new Uint8Array(data));
            receivedSize += data.byteLength;
            const progress = Math.round((receivedSize / fileToReceive.size) * 100);
            dom.progressBar.style.width = `${progress}%`;
            dom.progressText.textContent = getStatusText('receivingFile', { filename: fileToReceive.name, progress: progress });

            if (receivedSize === fileToReceive.size) {
                await fileWriter.close();
                dom.progressContainer.classList.add('hidden');
                dom.status.textContent = getStatusText('fileReceived');
                const li = document.createElement('li');
                li.textContent = `${fileToReceive.name} (${(fileToReceive.size / 1024 / 1024).toFixed(2)} MB) - Saved.`;
                dom.downloadList.prepend(li);
            }
        }
    };
    
    window.onbeforeunload = () => {
        if (fileWriter) {
            fileWriter.abort();
        }
    };
};

function listenForIceCandidates(iceCandidatesRef) {
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
}

const initializePeerConnection = () => {
    iceCandidateQueue = [];
    pc = new RTCPeerConnection(configuration);
    
    pc.onicecandidate = event => {
        if (event.candidate) {
            push(ref(db, `rooms/${roomId}/iceCandidates`), event.candidate.toJSON());
        }
    };
};

dom.createRoomBtn.onclick = async () => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert(getStatusText('enterRoomId')); return; }
    
    initializePeerConnection();
    dataChannel = pc.createDataChannel('fileTransfer', { ordered: true });
    setupDataChannelEvents(dataChannel);
    
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
    
    listenForIceCandidates(ref(db, `rooms/${roomId}/iceCandidates`));
    showTransferArea();
};

dom.joinRoomBtn.onclick = async () => {
    roomId = dom.roomIdInput.value.trim();
    if (!roomId) { alert(getStatusText('enterRoomId')); return; }

    const roomRef = ref(db, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) { alert(getStatusText('roomNotFound')); return; }

    initializePeerConnection();
    pc.ondatachannel = event => {
        dataChannel = event.channel;
        setupDataChannelEvents(dataChannel);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(roomSnapshot.val().offer));
    iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
    iceCandidateQueue = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await update(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });
    
    listenForIceCandidates(ref(db, `rooms/${roomId}/iceCandidates`));
    showTransferArea();
};

dom.fileInput.addEventListener('change', () => {
    const file = dom.fileInput.files[0];
    if (file) {
        dom.fileNameDisplay.textContent = file.name;
        
        let sendBtn = dom.fileSender.querySelector('#send-file-btn');
        if (!sendBtn) {
            sendBtn = document.createElement('button');
            sendBtn.id = 'send-file-btn';
            sendBtn.style.marginTop = '1rem';
            sendBtn.style.backgroundColor = 'var(--primary-color)';
            sendBtn.style.color = 'white';
            dom.fileSender.appendChild(sendBtn);
        }
        sendBtn.textContent = `Send ${file.name}`;

        sendBtn.onclick = () => {
            sendBtn.disabled = true;
            dom.progressContainer.classList.remove('hidden');
            
            dataChannel.send(JSON.stringify({ name: file.name, type: file.type, size: file.size }));

            const chunkSize = 16384; 
            const highWaterMark = 1024 * 1024;
            let offset = 0;

            const readSlice = () => {
                if (offset >= file.size) return;
                
                const slice = file.slice(offset, offset + chunkSize);
                const reader = new FileReader();
                
                reader.onload = e => {
                    if (dataChannel.readyState !== 'open') return;

                    try {
                        dataChannel.send(e.target.result);
                        offset += e.target.result.byteLength;
                        const progress = Math.round((offset / file.size) * 100);
                        dom.progressBar.style.width = `${progress}%`;
                        dom.progressText.textContent = getStatusText('sendingFile', { filename: file.name, progress: progress });
                    } catch (error) {
                        console.error('Send error:', error);
                        return; 
                    }
                    
                    if (offset < file.size) {
                        if (dataChannel.bufferedAmount < highWaterMark) {
                            readSlice();
                        } else {
                            dataChannel.onbufferedamountlow = () => {
                                dataChannel.onbufferedamountlow = null;
                                readSlice();
                            };
                        }
                    } else {
                        dom.status.textContent = getStatusText('fileSent');
                        dom.fileNameDisplay.textContent = '';
                        dom.fileInput.value = '';
                        sendBtn.remove();
                        setTimeout(() => dom.progressContainer.classList.add('hidden'), 2000);
                    }
                };
                reader.readAsArrayBuffer(slice);
            };
            readSlice();
        };
    }
});

const startApp = () => {
    dom.privacyModal.classList.add('hidden');
    dom.appContainer.classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    setupLanguage();

    dom.acceptPrivacyBtn.addEventListener('click', () => {
        localStorage.setItem('privacyAccepted', 'true');
        startApp();
    });

    if (localStorage.getItem('privacyAccepted') === 'true') {
        startApp();
    } else {
        dom.privacyModal.classList.remove('hidden');
    }
});