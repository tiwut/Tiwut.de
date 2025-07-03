
document.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('app-grid-container')) {
        initAppStorePage();
    }
});

function initAppStorePage() {
    const appGridContainer = document.getElementById('app-grid-container');
    if (!appGridContainer) {
        console.error('App grid container not found!');
        return;
    }

    fetchAppsList()
        .then(apps => {
            if (apps.length === 0) {
                appGridContainer.innerHTML = '<p class="no-apps-message">Keine Apps im Store gefunden.</p>';
                return;
            }
            renderApps(apps, appGridContainer);
        })
        .catch(error => {
            console.error('Error loading apps:', error);
            appGridContainer.innerHTML = '<p class="no-apps-message error-message">Fehler beim Laden der Apps.</p>';
        });
}

async function fetchAppsList() {
    try {
        const response = await fetch('./AppStore/apps.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return parseAppsText(text);
    } catch (error) {
        console.error("Could not fetch apps list:", error);
        return []; 
    }
}

function parseAppsText(text) {
    const lines = text.split('\n');
    const apps = [];
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) { 
            const parts = trimmedLine.split(',');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const url = parts.slice(1).join(',').trim(); 
                if (name && url) {
                    apps.push({ name, url });
                }
            }
        }
    });
    return apps;
}

function renderApps(apps, container) {
    container.innerHTML = ''; 

    apps.forEach(app => {
        const appElement = document.createElement('a');
        appElement.href = app.url;
        appElement.target = '_blank'; 
        appElement.rel = 'noopener noreferrer';
        appElement.classList.add('app-item');
        


        const icon = document.createElement('img');
        icon.src = getFaviconUrl(app.url);
        icon.alt = `${app.name} Logo`;
        icon.onerror = function() {
            
            this.onerror = null; 
            this.src = './AppStore/placeholder.png'; 
            this.classList.add('placeholder-icon');
        };

        const nameElement = document.createElement('span');
        nameElement.classList.add('app-name');
        nameElement.textContent = app.name;

        appElement.appendChild(icon);
        appElement.appendChild(nameElement);
        container.appendChild(appElement);
    });

    
}

function getFaviconUrl(appUrl) {
    try {
        const url = new URL(appUrl);
        
        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } catch (e) {
        console.warn(`Invalid URL for favicon: ${appUrl}`);
        
        return './AppStore/placeholder.png';
    }
}

