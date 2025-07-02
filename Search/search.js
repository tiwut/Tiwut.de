document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Konfiguration und Übersetzungen ---
    const translations = {
        de: {
            siteTitle: "Website Suche",
            title: "Durchsuche die Website",
            placeholder: "Tags: KI, Team, Service...",
            loading: "Such-Index wird geladen...",
            noResults: "Keine Ergebnisse gefunden.",
            mainPage: "Hauptseite"
        },
        en: {
            siteTitle: "Website Search",
            title: "Search the Website",
            placeholder: "Tags: AI, team, service...",
            loading: "Loading search index...",
            noResults: "No results found.",
            mainPage: "Main Page"
        },
        es: {
            siteTitle: "Búsqueda en el Sitio Web",
            title: "Buscar en el Sitio Web",
            placeholder: "Tags: IA, equipo, servicio...",
            loading: "Cargando índice de búsqueda...",
            noResults: "No se encontraron resultados.",
            mainPage: "Página Principal"
        }
    };

    // --- 2. DOM-Elemente holen ---
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const langSwitcher = document.getElementById('lang-switcher');
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');

    let searchData = [];
    let currentLanguage = 'en';
    const supportedLangs = ['de', 'en', 'es'];

    // --- 3. Cursor-Steuerung ---
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        cursorDot.style.transform = `translate(${clientX}px, ${clientY}px)`;
        cursorCircle.style.transform = `translate(${clientX}px, ${clientY}px)`;
    });

    const setupCursorInteraction = () => {
        document.querySelectorAll('a, button, input').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-interactive'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-interactive'));
        });
    };
    
    // --- 4. Sprach-Management ---
    function getInitialLanguage() {
        const preferredLang = localStorage.getItem('preferredLang');
        if (preferredLang && supportedLangs.includes(preferredLang)) return preferredLang;
        const browserLang = navigator.language.split('-')[0];
        if (supportedLangs.includes(browserLang)) return browserLang;
        return 'en';
    }

    function setLanguage(lang) {
        if (!supportedLangs.includes(lang)) return;
        currentLanguage = lang;
        localStorage.setItem('preferredLang', lang);

        document.querySelectorAll('[data-key]').forEach(elem => {
            const key = elem.dataset.key;
            if (translations[lang][key]) elem.textContent = translations[lang][key];
        });
        document.querySelectorAll('[data-key-placeholder]').forEach(elem => {
            const key = elem.dataset.keyPlaceholder;
            if (translations[lang][key]) elem.placeholder = translations[lang][key];
        });
        
        langSwitcher.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        performSearch();
    }

    // --- 5. Suchlogik (jetzt mit Tags) ---
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        resultsContainer.innerHTML = '';
        if (query.length === 0) return;

        const foundResults = searchData.filter(item => {
            const title = item.title[currentLanguage]?.toLowerCase() || '';
            const content = item.content[currentLanguage]?.toLowerCase() || '';
            // NEU: Tags durchsuchen
            const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(query));
            
            return title.includes(query) || content.includes(query) || tagsMatch;
        });
        displayResults(foundResults);
    }

    function displayResults(results) {
        if (results.length > 0) {
            results.forEach(item => {
                const resultElement = document.createElement('div');
                resultElement.className = 'result-item';
                
                const title = item.title[currentLanguage] || item.title.en;
                const contentSnippet = (item.content[currentLanguage] || item.content.en).substring(0, 150);

                // NEU: Tag-Anzeige hinzufügen
                let tagsHTML = '';
                if (item.tags && item.tags.length > 0) {
                    tagsHTML = `<div class="result-tags">
                        ${item.tags.map(tag => `<span>#${tag}</span>`).join('')}
                    </div>`;
                }

                resultElement.innerHTML = `
                    <a href="${item.url}">${title}</a>
                    <p>${contentSnippet}...</p>
                    ${tagsHTML}
                `;
                resultsContainer.appendChild(resultElement);
            });
        } else {
            resultsContainer.innerHTML = `<p class="feedback-message">${translations[currentLanguage].noResults}</p>`;
        }
        // Wichtig: Nach dem Anzeigen der Ergebnisse die Cursor-Interaktion neu initialisieren
        setupCursorInteraction(); 
    }

    // --- 6. Initialisierung ---
    function initialize() {
        currentLanguage = getInitialLanguage();
        setLanguage(currentLanguage);
        setupCursorInteraction();

        resultsContainer.innerHTML = `<p class="feedback-message">${translations[currentLanguage].loading}</p>`;

        fetch('search_index.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                searchData = data;
                resultsContainer.innerHTML = '';
                console.log('Search index loaded successfully.');
            })
            .catch(error => {
                console.error('Failed to load search index:', error);
                resultsContainer.innerHTML = `<p class="feedback-message">Error loading search data.</p>`;
            });

        searchInput.addEventListener('input', performSearch);
        langSwitcher.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON') setLanguage(e.target.dataset.lang);
        });
    }

    initialize();
});