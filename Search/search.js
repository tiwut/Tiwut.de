document.addEventListener('DOMContentLoaded', () => {

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

    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const langSwitcher = document.getElementById('lang-switcher');
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');
    const contentLayout = document.getElementById('content-layout');

    let searchData = [];
    let currentLanguage = 'en';
    const supportedLangs = ['de', 'en', 'es'];

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        cursorDot.style.left = `${clientX}px`;
        cursorDot.style.top = `${clientY}px`;
        cursorCircle.style.left = `${clientX}px`;
        cursorCircle.style.top = `${clientY}px`;
    });

    const setupCursorInteraction = () => {
        document.querySelectorAll('a, button, input').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-interactive'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-interactive'));
        });
    };
    
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
            if (translations[lang][key]) {
                 const childSpan = elem.querySelector('span[data-key]');
                if(childSpan) {
                    childSpan.textContent = translations[lang][key];
                } else {
                    elem.textContent = translations[lang][key];
                }
            }
        });
        document.querySelectorAll('[data-key-placeholder]').forEach(elem => {
            const key = elem.dataset.keyPlaceholder;
            if (translations[lang][key]) elem.placeholder = translations[lang][key];
        });
        
        langSwitcher.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        const mainPageLink = document.querySelector('.main-page-link span');
        if (mainPageLink) {
             mainPageLink.textContent = translations[lang].mainPage;
        }

        performSearch();
    }

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        resultsContainer.innerHTML = '';
        if (query.length === 0) return;

        const foundResults = searchData.filter(item => {
            const title = item.title[currentLanguage]?.toLowerCase() || '';
            const content = item.content[currentLanguage]?.toLowerCase() || '';
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

                let tagsHTML = '';
                if (item.tags && item.tags.length > 0) {
                    tagsHTML = `<div class="result-tags">
                        ${item.tags.map(tag => `<span>#${tag}</span>`).join('')}
                    </div>`;
                }

                resultElement.innerHTML = `
                    <a href="${item.url}" rel="noopener noreferrer">${title}</a>
                    <p>${contentSnippet}...</p>
                    ${tagsHTML}
                `;
                resultsContainer.appendChild(resultElement);
            });
        } else {
            resultsContainer.innerHTML = `<p class="feedback-message">${translations[currentLanguage].noResults}</p>`;
        }
        setupCursorInteraction(); 
    }

    function initDesktopInteractions() { 
        if (window.matchMedia("(pointer: fine)").matches) {
            document.body.style.perspective = '1500px';
            document.addEventListener('mousemove', e => {
                const x = (e.clientX / window.innerWidth) - 0.5;
                const y = (e.clientY / window.innerHeight) - 0.5;
                if(contentLayout) {
                    contentLayout.style.transform = `rotateY(calc(${x} * 6deg)) rotateX(calc(${y} * -6deg))`;
                }
            });
        }
    }

    function initialize() {
        currentLanguage = getInitialLanguage();
        setLanguage(currentLanguage);
        setupCursorInteraction();
        initDesktopInteractions();

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