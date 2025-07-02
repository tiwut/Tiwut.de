document.addEventListener('DOMContentLoaded', async () => {
    const guideListElement = document.getElementById('guideList');
    const searchInputElement = document.getElementById('searchInput');
    const statusMessageElement = document.getElementById('statusMessage');
    const languageSelector = document.getElementById('languageSelector');
    let allGuideNames = [];

    // --- i18next Initialization ---
    // Initialize translation library
    await i18next
        .use(i18nextBrowserLanguageDetector) // Detect user's language
        .use(i18nextHttpBackend) // Load translations from server
        .init({
            fallbackLng: 'en', // Fallback language if detection fails
            debug: true, // Set to false in production
            backend: {
                loadPath: 'locales/{{lng}}/translation.json' // Path to translation files
            }
        });

    // Function to update all text content on the page
    const updateContent = () => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.innerHTML = i18next.t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = i18next.t(key);
        });
    };

    // Update content on initial load
    updateContent();
    // Set language selector to the current language
    languageSelector.value = i18next.language.split('-')[0]; // Use 'de' instead of 'de-DE'

    // Listen for language changes from the selector
    languageSelector.addEventListener('change', (e) => {
        i18next.changeLanguage(e.target.value, () => {
            updateContent();
            // Re-filter guides if a search term exists, as status messages need translation
            handleSearch(); 
        });
    });
    // --- End of i18next ---


    // --- IMPORTANT ---
    // For this 'fetch' to work, serve your 'index.html' file through a web server.
    async function loadGuides() {
        try {
            const response = await fetch('guides.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Could not load guides.txt`);
            }
            const text = await response.text();
            allGuideNames = text.split('\n')
                                .map(name => name.trim())
                                .filter(name => name);

            if (allGuideNames.length > 0) {
                displayGuides(allGuideNames);
                statusMessageElement.textContent = '';
            } else {
                guideListElement.innerHTML = '';
                statusMessageElement.textContent = i18next.t('statusNoGuidesInFile');
            }
        } catch (error) {
            console.error('Error fetching or parsing guides.txt:', error);
            guideListElement.innerHTML = '';
            // Use i18next for translation, with interpolation for the message
            statusMessageElement.textContent = i18next.t('statusError', { message: error.message });

            if (window.location.protocol === "file:") {
                statusMessageElement.innerHTML += i18next.t('statusErrorFileProtocol');
            }
        }
    }

    function displayGuides(guidesToDisplay) {
        guideListElement.innerHTML = '';
        
        if (guidesToDisplay.length === 0 && searchInputElement.value.trim() !== '') {
            statusMessageElement.textContent = i18next.t('statusNoGuidesFound');
            statusMessageElement.style.display = 'block';
            return;
        } else if (guidesToDisplay.length === 0 && allGuideNames.length > 0) {
            statusMessageElement.textContent = i18next.t('statusNoGuidesFound');
            statusMessageElement.style.display = 'block';
            return;
        }
        
        statusMessageElement.style.display = 'none';

        guidesToDisplay.forEach((guideName, index) => { // 'index' hinzugefügt
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `./${guideName}/`;

            const icon = document.createElement('img');
            icon.src = `./${guideName}/main.ico`;
            icon.alt = `${guideName} icon`;
            icon.onerror = function() {
                this.src = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-16zM9 17l-3.5-3.5 1.41-1.41L9 14.17l6.09-6.09L16.5 9.5 9 17z"/></svg>';
                this.style.border = "1px solid #555";
                this.style.padding = "1px";
            };

            const nameSpan = document.createElement('span');
            nameSpan.className = 'guide-name';
            nameSpan.textContent = guideName.replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|$))/g, ' $1$2').trim();

            link.appendChild(icon);
            link.appendChild(nameSpan);
            listItem.appendChild(link);
            
            // *** NEUE ÄNDERUNG FÜR ANIMATION ***
            // Fügt eine Klasse für die CSS-Animation hinzu und setzt eine individuelle
            // Verzögerung für jedes Element, um den gestaffelten Effekt zu erzeugen.
            listItem.classList.add('list-item-animate');
            listItem.style.animationDelay = `${index * 50}ms`; // 50ms Verzögerung pro Element
            // *** ENDE DER ÄNDERUNG ***

            guideListElement.appendChild(listItem);
        });
    }

    function handleSearch() {
        const searchTerm = searchInputElement.value.toLowerCase().trim();
        if (!allGuideNames || allGuideNames.length === 0) {
            if (statusMessageElement.textContent === '') {
                statusMessageElement.textContent = i18next.t('statusGuidesNotLoaded');
                statusMessageElement.style.display = 'block';
            }
            return;
        }

        const filteredGuides = allGuideNames.filter(guideName => 
            guideName.toLowerCase().includes(searchTerm)
        );
        displayGuides(filteredGuides);
    }

    // Initial load
    await loadGuides();

    // Event listener for search input
    searchInputElement.addEventListener('input', handleSearch);
});