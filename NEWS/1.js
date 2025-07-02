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
    let currentLanguage = 'en'; // Standard-Fallback

    // --- Sprachfunktionen ---
    function applyTranslations() {
        const lang = currentLanguage;
        const dict = translations[lang];

        // HTML-Tag und Seitentitel aktualisieren
        document.documentElement.lang = lang;
        document.title = dict.pageTitle;

        // Elemente mit data-translate-key aktualisieren
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (dict[key]) {
                element.textContent = dict[key];
            }
        });

        // Spezifische Attribute aktualisieren
        prevButton.setAttribute('aria-label', dict.prevAria);
        nextButton.setAttribute('aria-label', dict.nextAria);
        
        // Dynamische Texte neu rendern, falls sie schon existieren
        if (mediaItems.length > 0) {
            updateItemInfo();
        }
    }

    function setLanguage(lang) {
        // Fallback auf Englisch, wenn Sprache nicht unterstützt wird
        currentLanguage = translations[lang] ? lang : 'en';
        langSelector.value = currentLanguage;
        applyTranslations();
    }

    function initI18n() {
        const browserLang = navigator.language.split('-')[0]; // z.B. 'de' aus 'de-DE'
        setLanguage(browserLang);
        
        langSelector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // --- Kernfunktionalität ---
    async function fetchMediaSources() {
        try {
            const response = await fetch('source.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - source.txt nicht gefunden.`);
            }
            const text = await response.text();
            mediaItems = text.split('\n').map(line => line.trim()).filter(line => line);
            
            if (mediaItems.length > 0) {
                displayMedia(currentIndex);
                updateNavigation();
            } else {
                mediaDisplay.innerHTML = `<p class="empty-message">${translations[currentLanguage].noSources}</p>`;
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
                currentItemInfo.textContent = '';
            }
        } catch (error) {
            console.error('Fehler beim Laden der Mediendateien:', error);
            const errorMessage = translations[currentLanguage].fetchError.replace('{status}', error.message);
            mediaDisplay.innerHTML = `<p class="empty-message">${errorMessage}</p>`;
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }
    }

    function displayMedia(index) {
        if (mediaItems.length === 0) return;
        
        if (imageTimeoutId) clearTimeout(imageTimeoutId);
        imageTimeoutId = null;

        const mediaPath = mediaItems[index];
        const extension = mediaPath.split('.').pop().toLowerCase();
        mediaDisplay.innerHTML = '';

        let mediaElement;

        if (['mp4', 'webm', 'ogg'].includes(extension)) {
            mediaElement = document.createElement('video');
            mediaElement.src = mediaPath;
            mediaElement.autoplay = true;
            mediaElement.muted = true;
            mediaElement.controls = true;
            mediaElement.onended = () => { if (mediaItems.length > 1) nextMedia(); };
            mediaElement.onerror = () => handleMediaError(mediaPath);
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            mediaElement = document.createElement('img');
            mediaElement.src = mediaPath;
            mediaElement.alt = `Media ${index + 1}`;
            mediaElement.onload = () => { if (mediaItems.length > 1) imageTimeoutId = setTimeout(nextMedia, 5000); };
            mediaElement.onerror = () => handleMediaError(mediaPath);
        } else {
            const unknownFormatMsg = translations[currentLanguage].unknownFormat.replace('{path}', mediaPath);
            mediaDisplay.innerHTML = `<p class="empty-message">${unknownFormatMsg}</p>`;
            if (mediaItems.length > 1) imageTimeoutId = setTimeout(nextMedia, 2000);
            updateItemInfo();
            return;
        }
        
        mediaDisplay.appendChild(mediaElement);
        updateItemInfo();
    }

    function handleMediaError(mediaPath) {
        console.error(`Fehler beim Laden von: ${mediaPath}`);
        const filename = mediaPath.split('/').pop();
        const errorMsg = translations[currentLanguage].mediaError.replace('{filename}', filename);
        mediaDisplay.innerHTML = `<p class="empty-message">${errorMsg}</p>`;
        if (mediaItems.length > 1) {
            if (imageTimeoutId) clearTimeout(imageTimeoutId);
            imageTimeoutId = setTimeout(nextMedia, 3000);
        }
    }

    function nextMedia() {
        currentIndex = (currentIndex + 1) % mediaItems.length;
        displayMedia(currentIndex);
    }

    function prevMedia() {
        currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
        displayMedia(currentIndex);
    }

    function updateNavigation() {
        if (mediaItems.length <= 1) {
            newsContainer.classList.add('single-item');
        } else {
            newsContainer.classList.remove('single-item');
        }
    }
    
    function updateItemInfo() {
        if (mediaItems.length > 0) {
            const filename = mediaItems[currentIndex].split('/').pop();
            currentItemInfo.textContent = translations[currentLanguage].itemInfo
                .replace('{current}', currentIndex + 1)
                .replace('{total}', mediaItems.length)
                .replace('{filename}', filename);
        } else {
            currentItemInfo.textContent = '';
        }
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
    initI18n(); // Sprache einstellen und UI übersetzen
    fetchMediaSources(); // Medieninhalte laden
});