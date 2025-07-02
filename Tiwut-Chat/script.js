// --- Translations Object (Vollständig für EN, DE, ES) ---
const translations = {
    // Page Titles
    chatPageTitle: { en: 'Tiwut Chat', de: 'Tiwut Chat', es: 'Tiwut Chat' },
    loginPageTitle: { en: 'Login - Tiwut Chat', de: 'Anmelden - Tiwut Chat', es: 'Iniciar Sesión - Tiwut Chat' },
    registerPageTitle: { en: 'Register - Tiwut Chat', de: 'Registrieren - Tiwut Chat', es: 'Registrarse - Tiwut Chat' },
    termsTitle: { en: 'Terms and Conditions', de: 'Allgemeine Geschäftsbedingungen', es: 'Términos y Condiciones' },
    
    // UI Elements
    changeLanguage: { en: 'Change language', de: 'Sprache ändern', es: 'Cambiar idioma' },
    tiwutHomepageLink: { en: 'Tiwut Homepage', de: 'Tiwut Homepage', es: 'Página de Tiwut' },
    tiwutChat: { en: 'Tiwut Chat', de: 'Tiwut Chat', es: 'Tiwut Chat' },
    selectAChat: { en: 'Select a chat to start messaging.', de: 'Wähle einen Chat aus, um zu beginnen.', es: 'Selecciona un chat para empezar a conversar.' },
    loadingChats: { en: 'Loading chat rooms...', de: 'Lade Chaträume...', es: 'Cargando salas de chat...' },
    noChatsFound: { en: 'No matching chat rooms found.', de: 'Keine passenden Chaträume gefunden.', es: 'No se encontraron salas de chat.' },
    searchPlaceholder: { en: 'Search or start a new chat...', de: 'Suchen oder neuen Chat starten...', es: 'Buscar o empezar un nuevo chat...' },
    createChatTitle: { en: 'Create new chat', de: 'Neuen Chat erstellen', es: 'Crear nuevo chat' },
    newRoomPlaceholder: { en: 'New room name...', de: 'Name des neuen Raums...', es: 'Nombre de la nueva sala...' },
    create: { en: 'Create', de: 'Erstellen', es: 'Crear' },
    cancel: { en: 'Cancel', de: 'Abbrechen', es: 'Cancelar' },
    backButton: { en: 'Back', de: 'Zurück', es: 'Atrás' },
    typeMessagePlaceholder: { en: 'Type a message...', de: 'Nachricht eingeben...', es: 'Escribe un mensaje...' },
    loginPromptText: { en: 'See all chats and participate!', de: 'Sieh alle Chats und nimm teil!', es: '¡Mira todos los chats y participa!' },

    // Auth & Account
    loginTitle: { en: 'Login to Tiwut Chat', de: 'Bei Tiwut Chat anmelden', es: 'Iniciar sesión en Tiwut Chat' },
    registerTitle: { en: 'Create an account', de: 'Konto erstellen', es: 'Crear una cuenta' },
    usernameLabel: { en: 'Username:', de: 'Benutzername:', es: 'Nombre de usuario:' },
    passwordLabel: { en: 'Password:', de: 'Passwort:', es: 'Contraseña:' },
    displayNameLabel: { en: 'Display Name:', de: 'Anzeigename:', es: 'Nombre para mostrar:' },
    passwordMin6Label: { en: 'Password (min. 6 characters):', de: 'Passwort (min. 6 Zeichen):', es: 'Contraseña (mín. 6 caracteres):' },
    confirmPasswordLabel: { en: 'Confirm Password:', de: 'Passwort bestätigen:', es: 'Confirmar contraseña:' },
    iAccept: { en: 'I accept the', de: 'Ich akzeptiere die', es: 'Acepto los' },
    termsAndConditions: { en: 'Terms and Conditions', de: 'Allgemeinen Geschäftsbedingungen', es: 'Términos y Condiciones' },
    login: { en: 'Login', de: 'Anmelden', es: 'Iniciar sesión' },
    register: { en: 'Register', de: 'Registrieren', es: 'Registrarse' },
    logout: { en: 'Logout', de: 'Abmelden', es: 'Cerrar sesión' },
    noAccountPrompt: { en: "Don't have an account?", de: 'Noch kein Konto?', es: '¿No tienes una cuenta?' },
    registerHere: { en: 'Register here', de: 'Hier registrieren', es: 'Regístrate aquí' },
    haveAccountPrompt: { en: 'Already have an account?', de: 'Bereits ein Konto?', es: '¿Ya tienes una cuenta?' },
    loginHere: { en: 'Login here', de: 'Hier anmelden', es: 'Inicia sesión aquí' },
    guest: { en: 'Guest', de: 'Gast', es: 'Invitado' },
    user: { en: 'User', de: 'Benutzer', es: 'Usuario' },
    accountMenuAriaLabel: { en: 'Account Menu', de: 'Konto-Menü', es: 'Menú de Cuenta' },

    // Status & Error Messages
    loggingIn: { en: 'Logging in...', de: 'Melde an...', es: 'Iniciando sesión...' },
    loginError: { en: 'Error: Invalid username or password.', de: 'Fehler: Ungültiger Benutzername oder Passwort.', es: 'Error: Usuario o contraseña incorrectos.' },
    registering: { en: 'Registering...', de: 'Registrierung läuft...', es: 'Registrando...' },
    passwordMismatch: { en: 'Passwords do not match.', de: 'Passwörter stimmen nicht überein.', es: 'Las contraseñas no coinciden.' },
    usernameTaken: { en: 'Username is already taken.', de: 'Benutzername ist bereits vergeben.', es: 'El nombre de usuario ya está en uso.' },
    weakPassword: { en: 'Password is too weak (min 6 characters).', de: 'Passwort ist zu schwach (min. 6 Zeichen).', es: 'La contraseña es demasiado débil (mín. 6 caracteres).' },
    registrationError: { en: 'Registration failed:', de: 'Registrierung fehlgeschlagen:', es: 'Error en el registro:' },
    createRoomError: { en: 'Could not create chat room.', de: 'Chatraum konnte nicht erstellt werden.', es: 'No se pudo crear la sala de chat.' },
    connected: { en: 'Connected', de: 'Verbunden', es: 'Conectado' },
    readOnlyMode: { en: 'Read-only mode. Login to chat.', de: 'Nur-Lese-Modus. Zum Chatten anmelden.', es: 'Modo de solo lectura. Inicia sesión para chatear.' },
    loadingMessages: { en: 'Loading messages...', de: 'Lade Nachrichten...', es: 'Cargando mensajes...' },
    sendError: { en: 'Send Error:', de: 'Sende-Fehler:', es: 'Error al enviar:' },
    createdBy: { en: 'by', de: 'von', es: 'por' },
    unknownUser: { en: 'Unknown', de: 'Unbekannt', es: 'Desconocido' },

    // --- VOLLSTÄNDIGE NUTZUNGSBEDINGUNGEN ---
    termsContent: {
        en: `
            <h3>1. Agreement to Terms</h3>
            <p>By accessing and using this service, you agree to be bound by these terms. This service is provided exclusively for private and family purposes. Commercial use is strictly prohibited.</p>
            
            <h3>2. User Accounts and Responsibility</h3>
            <p>You are responsible for all activities that occur under your account. You agree not to share your account password. You must notify us immediately of any unauthorized use of your account.</p>
            
            <h3>3. User Conduct</h3>
            <p>You agree not to use the service to post or transmit any content that is unlawful, defamatory, harassing, abusive, fraudulent, or obscene. Content that infringes on the rights of others (copyright, privacy) is also forbidden.</p>
            
            <h3>4. Disclaimer of Liability</h3>
            <p><strong>This service is provided "as is" and "as available" without any warranties, express or implied. The operator assumes no liability for any damages arising from the use of this service.</strong> This includes, but is not limited to, direct, indirect, incidental, or consequential damages, loss of data, or other intangible losses.</p>
            <p>The operator is not responsible for the content posted by users and does not monitor user content proactively. The responsibility for all posted content lies solely with the respective user.</p>
            
            <h3>5. Termination</h3>
            <p>We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including a breach of these terms. This is a private project, and access can be revoked at the operator's sole discretion.</p>
            
            <h3>6. Governing Law</h3>
            <p>These terms shall be governed by the laws of Germany, without respect to its conflict of law provisions.</p>
        `,
        de: `
            <h3>1. Zustimmung zu den Bedingungen</h3>
            <p>Durch den Zugriff auf und die Nutzung dieses Dienstes erklären Sie sich mit diesen Bedingungen einverstanden. Dieser Dienst wird ausschließlich für private und familiäre Zwecke zur Verfügung gestellt. Eine kommerzielle Nutzung ist strengstens untersagt.</p>
            
            <h3>2. Benutzerkonten und Verantwortung</h3>
            <p>Sie sind für alle Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden. Sie stimmen zu, Ihr Kontopasswort nicht weiterzugeben. Sie müssen uns unverzüglich über jede unbefugte Nutzung Ihres Kontos informieren.</p>
            
            <h3>3. Nutzerverhalten</h3>
            <p>Sie erklären sich damit einverstanden, den Dienst nicht zur Veröffentlichung oder Übertragung von Inhalten zu verwenden, die rechtswidrig, verleumderisch, belästigend, missbräuchlich, betrügerisch oder obszön sind. Inhalte, die die Rechte anderer verletzen (Urheberrecht, Datenschutz), sind ebenfalls verboten.</p>
            
            <h3>4. Haftungsausschluss</h3>
            <p><strong>Dieser Dienst wird "wie besehen" und "wie verfügbar" ohne jegliche ausdrückliche oder stillschweigende Gewährleistung bereitgestellt. Der Betreiber übernimmt keine Haftung für Schäden, die aus der Nutzung dieses Dienstes entstehen.</strong> Dies umfasst, ist aber nicht beschränkt auf, direkte, indirekte, zufällige oder Folgeschäden, Datenverlust oder andere immaterielle Verluste.</p>
            <p>Der Betreiber ist nicht für die von Nutzern eingestellten Inhalte verantwortlich und überwacht diese nicht proaktiv. Die Verantwortung für alle eingestellten Inhalte liegt allein beim jeweiligen Nutzer.</p>
            
            <h3>5. Kündigung</h3>
            <p>Wir können Ihr Konto jederzeit ohne vorherige Ankündigung oder Haftung aus beliebigen Gründen kündigen oder sperren, einschließlich eines Verstoßes gegen diese Bedingungen. Dies ist ein privates Projekt, und der Zugang kann nach alleinigem Ermessen des Betreibers widerrufen werden.</p>
            
            <h3>6. Geltendes Recht</h3>
            <p>Diese Bedingungen unterliegen den Gesetzen Deutschlands, ohne Berücksichtigung der Kollisionsnormen.</p>
        `,
        es: `
            <h3>1. Aceptación de los Términos</h3>
            <p>Al acceder y utilizar este servicio, usted acepta estar sujeto a estos términos. Este servicio se proporciona exclusivamente para fines privados y familiares. El uso comercial está estrictamente prohibido.</p>
            
            <h3>2. Cuentas de Usuario y Responsabilidad</h3>
            <p>Usted es responsable de todas las actividades que ocurran en su cuenta. Acepta no compartir la contraseña de su cuenta. Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</p>
            
            <h3>3. Conducta del Usuario</h3>
            <p>Usted se compromete a no utilizar el servicio para publicar o transmitir contenido que sea ilegal, difamatorio, acosador, abusivo, fraudulento u obsceno. También está prohibido el contenido que infrinja los derechos de otros (derechos de autor, privacidad).</p>
            
            <h3>4. Exención de Responsabilidad</h3>
            <p><strong>Este servicio se proporciona "tal cual" y "según esté disponible" sin ninguna garantía, expresa o implícita. El operador no asume ninguna responsabilidad por los daños que surjan del uso de este servicio.</strong> Esto incluye, entre otros, daños directos, indirectos, incidentales o consecuentes, pérdida de datos u otras pérdidas intangibles.</p>
            <p>El operador no es responsable del contenido publicado por los usuarios y no supervisa el contenido de los usuarios de forma proactiva. La responsabilidad de todo el contenido publicado recae exclusivamente en el usuario respectivo.</p>
            
            <h3>5. Terminación</h3>
            <p>Podemos cancelar o suspender su cuenta en cualquier momento, sin previo aviso ni responsabilidad, por cualquier motivo, incluido el incumplimiento de estos términos. Este es un proyecto privado y el acceso puede ser revocado a la sola discreción del operador.</p>
            
            <h3>6. Legislación Aplicable</h3>
            <p>Estos términos se regirán por las leyes de Alemania, sin tener en cuenta sus disposiciones sobre conflictos de leyes.</p>
        `
    }
};

// --- Globale Variablen & Firebase Konfiguration ---
let currentFirebaseUser = null;
let activeFirebaseListeners = [];
const DUMMY_EMAIL_DOMAIN = "@tiwut-dummy.internal";
let currentLang = 'en';
let currentChatRoomId = null;
let firebaseApp, firebaseAuth, firebaseDb, authFunctions, dbFunctions;

const firebaseConfig = {
    apiKey: "AIzaSyCdgAfnqc_siAPdi7Ceoe8mW-wKjrRwKX0",
    authDomain: "tiwut-chat.firebaseapp.com",
    projectId: "tiwut-chat",
    databaseURL: "https://tiwut-chat-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "tiwut-chat.appspot.com",
    messagingSenderId: "640105042342",
    appId: "1:640105042342:web:e186683b85f367f05dbf67",
    measurementId: "G-880NY6R894"
};

// --- KERN-INITIALISIERUNGSABLAUF ---

document.addEventListener('DOMContentLoaded', () => {
    currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.lang = currentLang;
    initializeApp();
});

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    window.location.reload(); 
}

async function initializeApp() {
    translatePage();

    const isFirebaseInitialized = await initializeFirebase();
    if (!isFirebaseInitialized) return;

    authFunctions.onAuthStateChanged(firebaseAuth, (user) => {
        updateUIBasedOnAuthState(user);
        
        if (document.getElementById('chat-app')) {
            initChatApp();
        } else if (document.getElementById('login-form')) {
            initLoginPage();
        } else if (document.getElementById('register-form')) {
            initRegisterPage();
        } else if (document.getElementById('terms-content')){
            document.title = t('termsTitle');
        }
    });
}

// --- Übersetzungs- & Hilfsfunktionen ---
function t(key) { return translations[key]?.[currentLang] || translations[key]?.['en'] || key; }

function translatePage() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        // Use innerHTML for terms to render the HTML tags
        if (el.id === 'terms-content') {
            el.innerHTML = t(el.dataset.translate);
        } else {
            el.textContent = t(el.dataset.translate);
        }
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => el.placeholder = t(el.dataset.translatePlaceholder));
    document.querySelectorAll('[data-translate-title]').forEach(el => el.title = t(el.dataset.translateTitle));
    document.querySelectorAll('[data-translate-aria-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.translateAriaLabel)));

    if (document.getElementById('chat-app')) document.title = t('chatPageTitle');
    if (document.getElementById('login-form')) document.title = t('loginPageTitle');
    if (document.getElementById('register-form')) document.title = t('registerPageTitle');
    if (document.getElementById('terms-content')) document.title = t('termsTitle');
}

function htmlEscape(str) { if (!str) return ''; const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

function showStatusMessage(message, type = 'info', elementId = 'form-status') {
    const statusEl = document.getElementById(elementId);
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'status-message';
    statusEl.style.display = 'block';
    if (type === 'error') statusEl.classList.add('error-message');
    else if (type === 'success') statusEl.classList.add('success-message');
    else statusEl.classList.add('info-message');
}

function cleanupFirebaseListeners() { activeFirebaseListeners.forEach(unsub => unsub?.()); activeFirebaseListeners = []; }

// --- Firebase-Funktionen ---
async function initializeFirebase() {
    if (firebaseApp) return true;
    try {
        const appModule = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js");
        firebaseApp = appModule.initializeApp(firebaseConfig);
        const authModule = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js");
        firebaseAuth = authModule.getAuth(firebaseApp);
        authFunctions = authModule;
        const dbModule = await import("https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js");
        firebaseDb = dbModule.getDatabase(firebaseApp);
        dbFunctions = dbModule;
        return true;
    } catch (error) { console.error("FIREBASE INITIALIZATION FAILED:", error); return false; }
}

// --- UI- & Zustandsverwaltung ---
function updateUIBasedOnAuthState(user) {
    currentFirebaseUser = user ? { uid: user.uid, email: user.email, displayName: user.displayName || t('user') } : null;
    if (document.getElementById('chat-app')) { updateChatAppUI(user); }
}

function updateChatAppUI(user) {
    const accountDropdown = document.getElementById('account-dropdown');
    const loginPrompt = document.getElementById('login-prompt');
    const usernameEl = document.getElementById('header-username');
    const avatarWrapper = document.getElementById('user-avatar-wrapper');
    const name = user ? (user.displayName || t('user')) : t('guest');
    const initial = name.charAt(0).toUpperCase();

    avatarWrapper.innerHTML = `<span class="avatar-initial">${initial}</span>`;

    const tiwutLink = `<a href="https://tiwut.de/" target="_blank" rel="noopener noreferrer" data-translate="tiwutHomepageLink"></a>`;

    if (user) {
        document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'block');
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (usernameEl) usernameEl.textContent = name;
        
        accountDropdown.innerHTML = `${tiwutLink}<button class="logout-btn" id="logout-button-dropdown" data-translate="logout"></button>`;
        document.getElementById('logout-button-dropdown').addEventListener('click', logoutUser);
    } else {
        document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'none');
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (usernameEl) usernameEl.textContent = name;

        accountDropdown.innerHTML = `${tiwutLink}<a href="login.html" data-translate="login"></a><a href="register.html" data-translate="register"></a>`;
    }
    
    translatePage(); 

    const accountButton = document.getElementById('account-button');
    if (accountButton) {
        accountButton.onclick = (e) => {
            e.stopPropagation();
            accountDropdown.classList.toggle('visible');
        };
        document.addEventListener('click', (e) => {
            if (accountDropdown.classList.contains('visible') && !accountButton.contains(e.target)) {
                accountDropdown.classList.remove('visible');
            }
        });
    }
}

async function logoutUser() {
    try {
        await authFunctions.signOut(firebaseAuth);
        window.location.reload();
    } catch (error) { console.error("Logout failed:", error); }
}

// --- Seitenspezifische Logik ---

function initLanguageSelector() {
    const langButton = document.getElementById('language-button');
    const langDropdown = document.getElementById('language-dropdown');
    const currentLangText = document.getElementById('current-lang-text');

    if (!langButton || !langDropdown || !currentLangText) return;

    currentLangText.textContent = currentLang.toUpperCase();

    langButton.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.querySelectorAll('#language-dropdown button').forEach(button => {
        button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });

    document.addEventListener('click', (e) => {
        if (!langButton.contains(e.target)) {
            langDropdown.style.display = 'none';
        }
    });
}

function initChatApp() {
    initLanguageSelector();
    initChatList();

    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('roomId');
    if (roomIdFromUrl) { loadChatRoom(roomIdFromUrl); }
    
    document.getElementById('back-to-list-btn').addEventListener('click', () => {
        document.getElementById('chat-app').classList.remove('chat-active');
        history.pushState(null, '', 'index.html');
        currentChatRoomId = null;
        cleanupFirebaseListeners();
    });
}

function initChatList() {
    const listElement = document.getElementById('chat-room-list');
    const searchInput = document.getElementById('chat-search');
    const createBtn = document.getElementById('create-chat-btn');
    const formContainer = document.getElementById('create-chat-form-container');
    const chatForm = document.getElementById('create-chat-form');
    const cancelBtn = document.getElementById('cancel-chat-btn');
    const newChatNameInput = document.getElementById('new-chat-name');
    
    let allChatrooms = {};
    
    const chatroomsRef = dbFunctions.ref(firebaseDb, 'chatrooms');
    const unsubscribeChatrooms = dbFunctions.onValue(chatroomsRef, (snapshot) => {
        allChatrooms = snapshot.val() || {};
        renderChatList(allChatrooms, searchInput.value.toLowerCase());
    });
    activeFirebaseListeners.push(unsubscribeChatrooms);

    searchInput.addEventListener('input', (e) => renderChatList(allChatrooms, e.target.value.toLowerCase()));

    function renderChatList(rooms, filter) {
        listElement.innerHTML = '';
        let hasRooms = false;
        Object.entries(rooms).forEach(([roomId, roomData]) => {
            if (roomData?.name?.toLowerCase().includes(filter)) {
                hasRooms = true;
                const li = document.createElement('li');
                li.className = 'chat-room-list-item';
                li.dataset.roomId = roomId;
                if(roomId === currentChatRoomId) li.classList.add('active');

                const initial = roomData.name.charAt(0).toUpperCase() || '?';
                const creatorName = htmlEscape(roomData.creatorName || t('unknownUser'));

                li.innerHTML = `
                    <div class="avatar-display chat-avatar">
                        <span class="avatar-initial">${htmlEscape(initial)}</span>
                    </div>
                    <div class="chat-info">
                        <span class="room-name">${htmlEscape(roomData.name)}</span>
                        <span class="room-creator">${t('createdBy')} ${creatorName}</span>
                    </div>`;
                li.addEventListener('click', () => {
                    loadChatRoom(roomId);
                    document.querySelectorAll('.chat-room-list-item').forEach(item => item.classList.remove('active'));
                    li.classList.add('active');
                });
                listElement.appendChild(li);
            }
        });
        if (!hasRooms) { listElement.innerHTML = `<li class="no-chats-placeholder">${t('noChatsFound')}</li>`; }
    }

    if (createBtn) createBtn.onclick = () => formContainer.style.display = 'block';
    if (cancelBtn) cancelBtn.onclick = () => formContainer.style.display = 'none';
    if (chatForm) {
        chatForm.onsubmit = async (e) => {
            e.preventDefault();
            const chatName = newChatNameInput.value.trim();
            if (chatName && currentFirebaseUser) {
                try {
                    const newChatRef = dbFunctions.push(chatroomsRef);
                    await dbFunctions.set(newChatRef, { name: chatName, creatorUid: currentFirebaseUser.uid, creatorName: currentFirebaseUser.displayName || t('unknownUser'), createdAt: dbFunctions.serverTimestamp() });
                    newChatNameInput.value = '';
                    formContainer.style.display = 'none';
                } catch (error) { console.error("Error:", error); alert(t('createRoomError')); }
            }
        };
    }
}

function loadChatRoom(roomId) {
    if (currentChatRoomId === roomId && document.querySelector('.chat-container.chat-active')) return;
    
    cleanupFirebaseListeners();
    currentChatRoomId = roomId;

    const chatContainer = document.getElementById('chat-app');
    const placeholder = document.getElementById('chat-placeholder');
    const activeChat = document.getElementById('active-chat-container');
    const chatbox = document.getElementById('chatbox');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const chatTitle = document.getElementById('chat-room-title');
    const chatStatus = document.getElementById('chat-status');

    placeholder.style.display = 'none';
    activeChat.style.display = 'flex';
    chatContainer.classList.add('chat-active');
    history.pushState({ roomId }, `Chat ${roomId}`, `?roomId=${roomId}`);
    chatbox.innerHTML = `<p style="text-align:center; color: var(--text-secondary);">${t('loadingMessages')}</p>`;
    
    if (currentFirebaseUser) {
        messageInput.disabled = false; sendButton.disabled = false; chatStatus.textContent = t('connected');
    } else {
        messageInput.disabled = true; sendButton.disabled = true; chatStatus.textContent = t('readOnlyMode');
    }

    const roomMetaRef = dbFunctions.ref(firebaseDb, `chatrooms/${roomId}/name`);
    dbFunctions.get(roomMetaRef).then((snapshot) => {
        chatTitle.textContent = snapshot.val() ? htmlEscape(snapshot.val()) : `Room ${roomId.substring(0, 6)}`;
    });

    const messagesRef = dbFunctions.ref(firebaseDb, `chats/${roomId}/messages`);
    const messagesQuery = dbFunctions.query(messagesRef, dbFunctions.limitToLast(100));
    
    const unsubscribe = dbFunctions.onChildAdded(messagesQuery, (snapshot) => {
        if (chatbox.innerHTML.includes(t('loadingMessages'))) chatbox.innerHTML = '';
        displayMessage(snapshot);
    });
    activeFirebaseListeners.push(unsubscribe);

    function displayMessage(snapshot) {
        const msgData = snapshot.val();
        if (!msgData || typeof msgData.timestamp !== 'number') return;

        const isSentByMe = currentFirebaseUser && msgData.username === currentFirebaseUser.displayName;
        const msgClass = isSentByMe ? 'sent' : 'received is-group';
        
        const date = new Date(msgData.timestamp);
        const timeString = date.toLocaleTimeString(currentLang, { hour: '2-digit', minute: '2-digit' });

        const msgElement = document.createElement('div');
        msgElement.className = `message ${msgClass}`;
        msgElement.innerHTML = `
            <div class="message-content">
                <strong>${htmlEscape(msgData.username)}</strong>
                <p class="message-text">${htmlEscape(msgData.text)}</p>
            </div>
            <div class="message-meta">${timeString}</div>
        `;
        chatbox.appendChild(msgElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function sendChatMessage() {
        const messageText = messageInput.value.trim();
        if (messageText && currentFirebaseUser) {
            dbFunctions.push(messagesRef, {
                username: currentFirebaseUser.displayName, text: messageText, timestamp: dbFunctions.serverTimestamp()
            }).then(() => { messageInput.value = ''; messageInput.focus();
            }).catch(error => { console.error("Send Error:", error); chatStatus.textContent = `${t('sendError')} ${error.message}`; });
        }
    }
    
    sendButton.onclick = sendChatMessage;
    messageInput.onkeypress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage();} };
}

function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value;
        const fakeEmail = `${username.toLowerCase()}${DUMMY_EMAIL_DOMAIN}`;
        showStatusMessage(t('loggingIn'), 'info', 'login-status');
        try {
            await authFunctions.signInWithEmailAndPassword(firebaseAuth, fakeEmail, password);
            window.location.href = 'index.html';
        } catch (error) { showStatusMessage(t('loginError'), 'error', 'login-status'); }
    });
}

function initRegisterPage() {
    const registerForm = document.getElementById('register-form');
    const termsCheckbox = document.getElementById('terms');
    const submitButton = registerForm.querySelector('button[type="submit"]');

    termsCheckbox.onchange = () => { submitButton.disabled = !termsCheckbox.checked; };

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const displayName = registerForm.displayName.value.trim();
        const username = registerForm.username.value.trim();
        const password = registerForm.password.value;
        const passwordConfirm = registerForm.passwordConfirm.value;
        if (password !== passwordConfirm) { showStatusMessage(t('passwordMismatch'), 'error', 'register-status'); return; }
        
        showStatusMessage(t('registering'), 'info', 'register-status');
        const fakeEmail = `${username.toLowerCase()}${DUMMY_EMAIL_DOMAIN}`;
        const normalizedUsername = username.toLowerCase();
        const usernameRef = dbFunctions.ref(firebaseDb, `usernames/${normalizedUsername}`);
        try {
            const usernameSnap = await dbFunctions.get(usernameRef);
            if (usernameSnap.exists()) throw { code: 'custom/username-taken' };
            
            const userCredential = await authFunctions.createUserWithEmailAndPassword(firebaseAuth, fakeEmail, password);
            const user = userCredential.user;
            await authFunctions.updateProfile(user, { displayName: displayName });
            const updates = {};
            updates[`usernames/${normalizedUsername}`] = user.uid;
            updates[`users/${user.uid}/profile`] = { displayName: displayName };
            await dbFunctions.update(dbFunctions.ref(firebaseDb), updates);
            window.location.href = 'index.html';
        } catch (error) {
            let message = error.message;
            if (error.code === 'auth/email-already-in-use' || error.code === 'custom/username-taken') {
                message = t('usernameTaken');
            } else if (error.code === 'auth/weak-password') {
                message = t('weakPassword');
            }
            showStatusMessage(`${t('registrationError')} ${message}`, 'error', 'register-status');
        }
    });
}