document.addEventListener('DOMContentLoaded', () => {
    // --- DOM-Elemente ---
    const mediaDisplay = document.getElementById('mediaDisplay');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const currentItemInfo = document.getElementById('currentItemInfo');
    const newsContainer = document.querySelector('.news-container');
    const langSelector = document.getElementById('langSelector');

    // --- Übersetzungen ---
    const translations = {
        de: {
            pageTitle: "NACHRICHTEN",
            title: "NEWS",
            mainPage: "Hauptseite",
            loadingMessage: "Lade Nachrichten...",
            noSources: "Keine Nachrichtenquellen in source.txt gefunden.",
            fetchError: "Fehler beim Laden der Nachrichten: {status}",
            unknownFormat: "Unbekanntes Dateiformat: {path}",
            mediaError: "Fehler: Medium konnte nicht geladen werden.<br>({filename})",
            itemInfo: "Medium {current} von {total}: {filename}",
            prevAria: "Vorherige",
            nextAria: "Nächste"
        },
        en: {
            pageTitle: "NEWS",
            title: "NEWS",
            mainPage: "Main Page",
            loadingMessage: "Loading news...",
            noSources: "No news sources found in source.txt.",
            fetchError: "Error loading news: {status}",
            unknownFormat: "Unknown file format: {path}",
            mediaError: "Error: Media could not be loaded.<br>({filename})",
            itemInfo: "Item {current} of {total}: {filename}",
            prevAria: "Previous",
            nextAria: "Next"
        },
        es: {
            pageTitle: "NOTICIAS",
            title: "NOTICIAS",
            mainPage: "Página Principal",
            loadingMessage: "Cargando noticias...",
            noSources: "No se encontraron fuentes de noticias en source.txt.",
            fetchError: "Error al cargar las noticias: {status}",
            unknownFormat: "Formato de archivo desconocido: {path}",
            mediaError: "Error: No se pudo cargar el medio.<br>({filename})",
            itemInfo: "Elemento {current} de {total}: {filename}",
            prevAria: "Anterior",
            nextAria: "Siguiente"
        }
    };

    // --- Anwendungsstatus ---
    let mediaItems = [];
    let currentIndex = 0;
    let imageTimeoutId = null;
    let currentLanguage = 'en'; // WIRD SOFORT ÜBERSCHRIEBEN, DIENT NUR ALS ABSOLUTER FALLBACK
    let isTransitioning = false;

    // --- Sprachfunktionen ---
    function applyTranslations() {
        const lang = currentLanguage;
        const dict = translations[lang];

        document.documentElement.lang = lang;
        document.title = dict.pageTitle;

        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (dict[key]) {
                element.textContent = dict[key];
            }
        });

        prevButton.setAttribute('aria-label', dict.prevAria);
        nextButton.setAttribute('aria-label', dict.nextAria);
        
        if (mediaItems.length > 0) {
            updateItemInfo();
        }
    }

    function setLanguage(lang) {
        // Stellt sicher, dass die Sprache gültig ist, sonst Fallback auf 'en'
        currentLanguage = translations[lang] ? lang : 'en';
        langSelector.value = currentLanguage; // Aktualisiert das Dropdown-Menü
        applyTranslations();
    }

    // --- GEÄNDERT: Robuste Sprachinitialisierung ---
    function initI18n() {
        // Helferfunktion, um die beste Startsprache zu ermitteln
        const getInitialLanguage = () => {
            // 1. Priorität: Eine vom Benutzer manuell gespeicherte Sprache
            const savedLang = localStorage.getItem('userLanguage');
            if (savedLang && translations[savedLang]) {
                return savedLang;
            }

            // 2. Priorität: Die Sprache des Browsers
            const browserLang = navigator.language.split('-')[0]; // 'de' aus 'de-DE'
            if (translations[browserLang]) {
                return browserLang;
            }

            // 3. Priorität: Fallback auf Englisch
            return 'en';
        };

        const initialLang = getInitialLanguage();
        setLanguage(initialLang);

        // Event Listener für manuelle Sprachänderung
        langSelector.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            setLanguage(selectedLang);
            // WICHTIG: Speichere die manuelle Auswahl für zukünftige Besuche
            localStorage.setItem('userLanguage', selectedLang);
        });
    }

    // --- Kernfunktionalität (bleibt wie in der "krasse Animationen"-Version) ---
    async function fetchMediaSources() {
        try {
            const response = await fetch('source.txt');
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} - source.txt nicht gefunden.`); }
            const text = await response.text();
            mediaItems = text.split('\n').map(line => line.trim()).filter(line => line);
            
            if (mediaItems.length > 0) {
                displayMedia(currentIndex, 'next');
                updateNavigation();
            } else {
                // Hier wird die bereits übersetzte Nachricht verwendet
                mediaDisplay.innerHTML = `<p class="empty-message">${translations[currentLanguage].noSources}</p>`;
                newsContainer.classList.add('single-item');
                currentItemInfo.textContent = '';
            }
        } catch (error) {
            console.error('Fehler beim Laden der Mediendateien:', error);
            const errorMessage = translations[currentLanguage].fetchError.replace('{status}', error.message);
            mediaDisplay.innerHTML = `<p class="empty-message">${errorMessage}</p>`;
            newsContainer.classList.add('single-item');
        }
    }

    function displayMedia(index, direction) {
        if (mediaItems.length === 0 || isTransitioning) return;
        isTransitioning = true;

        if (imageTimeoutId) clearTimeout(imageTimeoutId);
        imageTimeoutId = null;

        const mediaPath = mediaItems[index];
        const extension = mediaPath.split('.').pop().toLowerCase();
        
        const oldElement = mediaDisplay.querySelector('.media-item.active');
        const mediaItemWrapper = document.createElement('div');
        mediaItemWrapper.classList.add('media-item');

        let mediaElement;

        if (['mp4', 'webm', 'ogg'].includes(extension)) {
            mediaElement = document.createElement('video');
            mediaElement.src = mediaPath;
            mediaElement.autoplay = true;
            mediaElement.muted = true;
            mediaElement.controls = true;
            mediaElement.onended = () => { if (mediaItems.length > 1) nextMedia(); };
            mediaElement.onerror = () => handleMediaError(mediaPath, mediaItemWrapper);
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            mediaElement = document.createElement('img');
            mediaElement.src = mediaPath;
            mediaElement.alt = `Media ${index + 1}`;
            mediaElement.onload = () => { if (mediaItems.length > 1) imageTimeoutId = setTimeout(nextMedia, 7000); };
            mediaElement.onerror = () => handleMediaError(mediaPath, mediaItemWrapper);
        } else {
            const unknownFormatMsg = translations[currentLanguage].unknownFormat.replace('{path}', mediaPath);
            mediaItemWrapper.innerHTML = `<p class="empty-message">${unknownFormatMsg}</p>`;
            if (mediaItems.length > 1) imageTimeoutId = setTimeout(nextMedia, 2000);
        }

        if (mediaElement) {
            mediaItemWrapper.appendChild(mediaElement);
        }
        
        mediaItemWrapper.classList.add(direction);
        mediaDisplay.appendChild(mediaItemWrapper);
        void mediaItemWrapper.offsetWidth;

        if (oldElement) {
            oldElement.classList.remove('active');
            oldElement.classList.add(direction === 'next' ? 'prev' : 'next');
        }
        mediaItemWrapper.classList.remove('next', 'prev');
        mediaItemWrapper.classList.add('active');
        
        updateItemInfo();

        setTimeout(() => {
            if (oldElement) oldElement.remove();
            const loadingMsg = mediaDisplay.querySelector('.loading-message');
            if(loadingMsg) loadingMsg.remove();
            isTransitioning = false;
        }, 700);
    }

    function handleMediaError(mediaPath, wrapperElement) {
        console.error(`Fehler beim Laden von: ${mediaPath}`);
        const filename = mediaPath.split('/').pop();
        const errorMsg = translations[currentLanguage].mediaError.replace('{filename}', filename);
        wrapperElement.innerHTML = `<p class="empty-message">${errorMsg}</p>`;
        if (mediaItems.length > 1) {
            if (imageTimeoutId) clearTimeout(imageTimeoutId);
            imageTimeoutId = setTimeout(nextMedia, 3000);
        }
    }

    function nextMedia() {
        if (isTransitioning) return;
        currentIndex = (currentIndex + 1) % mediaItems.length;
        displayMedia(currentIndex, 'next');
    }

    function prevMedia() {
        if (isTransitioning) return;
        currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        displayMedia(currentIndex, 'prev');
    }

    function updateNavigation() {
        if (mediaItems.length <= 1) {
            newsContainer.classList.add('single-item');
        } else {
            newsContainer.classList.remove('single-item');
        }
    }
    
    function updateItemInfo() {
        currentItemInfo.style.opacity = 0;
        setTimeout(() => {
            if (mediaItems.length > 0) {
                const filename = mediaItems[currentIndex].split('/').pop();
                currentItemInfo.textContent = translations[currentLanguage].itemInfo
                    .replace('{current}', currentIndex + 1)
                    .replace('{total}', mediaItems.length)
                    .replace('{filename}', filename);
            } else {
                currentItemInfo.textContent = '';
            }
            currentItemInfo.style.opacity = 1;
        }, 300);
    }

    // --- Event Listeners für Steuerung ---
    prevButton.addEventListener('click', () => { if (mediaItems.length > 1) prevMedia(); });
    nextButton.addEventListener('click', () => { if (mediaItems.length > 1) nextMedia(); });

    document.addEventListener('keydown', (e) => {
        if (mediaItems.length > 1) {
            if (e.key === 'ArrowLeft') prevMedia();
            else if (e.key === 'ArrowRight') nextMedia();
        }
    });

    // --- Initialisierung ---
    initI18n(); // Sprache einstellen und UI übersetzen (JETZT ROBUST)
    fetchMediaSources(); // Medieninhalte laden
});