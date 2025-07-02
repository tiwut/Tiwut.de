// --- START OF FILE appstore.js ---
document.addEventListener('DOMContentLoaded', () => {
    // Falls Swup verwendet wird und diese Seite via Swup geladen wird,
    // muss diese Funktion eventuell im 'page:view' Hook von Swup aufgerufen werden.
    // Für einen direkten Aufruf der HTML-Datei ist DOMContentLoaded ausreichend.
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
        return []; // Return empty array on error
    }
}

function parseAppsText(text) {
    const lines = text.split('\n');
    const apps = [];
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) { // Skip empty lines
            const parts = trimmedLine.split(',');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const url = parts.slice(1).join(',').trim(); // Handle URLs with commas if any (though unlikely)
                if (name && url) {
                    apps.push({ name, url });
                }
            }
        }
    });
    return apps;
}

function renderApps(apps, container) {
    container.innerHTML = ''; // Clear previous content

    apps.forEach(app => {
        const appElement = document.createElement('a');
        appElement.href = app.url;
        appElement.target = '_blank'; // Open in new tab
        appElement.rel = 'noopener noreferrer';
        appElement.classList.add('app-item');
        // Add animation class if you want them to animate-on-scroll
        // appElement.classList.add('animate-on-scroll');


        const icon = document.createElement('img');
        icon.src = getFaviconUrl(app.url);
        icon.alt = `${app.name} Logo`;
        icon.onerror = function() {
            // Fallback if favicon is not found or there's an error
            this.onerror = null; // Prevent infinite loop if placeholder also fails
            this.src = './AppStore/placeholder.png'; // Path to your placeholder image
            this.classList.add('placeholder-icon');
        };

        const nameElement = document.createElement('span');
        nameElement.classList.add('app-name');
        nameElement.textContent = app.name;

        appElement.appendChild(icon);
        appElement.appendChild(nameElement);
        container.appendChild(appElement);
    });

    // If using animate-on-scroll, re-initialize the observer for new items
    // This depends on how your main script.js handles this.
    // For simplicity here, we assume new items will be visible or handled by a global observer.
    // If not, you might need to re-run the observer setup from script.js for these new elements.
}

function getFaviconUrl(appUrl) {
    try {
        const url = new URL(appUrl);
        // Google's S2 service is a good option for fetching favicons
        // It provides a 16x16 favicon by default, you can request larger sizes
        // e.g., &sz=64 for 64x64
        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } catch (e) {
        console.warn(`Invalid URL for favicon: ${appUrl}`);
        // Fallback to a generic placeholder if URL is invalid
        return './AppStore/placeholder.png';
    }
}

// --- END OF FILE appstore.js ---