document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM geladen. Leaflet-Skript startet.");

    // Entfernt:
    // const waypointInput = document.getElementById('waypointInput');
    // const addWaypointBtn = document.getElementById('addWaypointBtn');
    const waypointListUI = document.getElementById('waypointList');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importJsonInput = document.getElementById('importJsonInput');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const showLocationBtn = document.getElementById('showLocationBtn');
    const totalDistanceEl = document.getElementById('totalDistance');
    const totalTimeEl = document.getElementById('totalTime');
    const unitSystemSelect = document.getElementById('unitSystem');

    let map;
    let routingControl = null;
    let waypoints = [];
    let mapClickTempMarker = null;
    let mapClickPopup = null;

    let currentUnitSystem = 'metric';
    let rawTotalDistanceMeters = 0;
    let rawTotalTimeSeconds = 0;
    const METERS_TO_MILES = 0.000621371;

    // 1. Karteninitialisierung
    function initMap() {
        console.log("initMap() wird aufgerufen.");
        try {
            map = L.map('map', {
                worldCopyJump: false
            }).setView([51.1657, 10.4515], 6);

            const southWest = L.latLng(-85.0511, -180);
            const northEast = L.latLng(85.0511, 180);
            const bounds = L.latLngBounds(southWest, northEast);
            map.setMaxBounds(bounds);

            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19, noWrap: true
            });
            const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                maxZoom: 17, noWrap: true
            });
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18, noWrap: true
            });
            const stadiaDarkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
                noWrap: true
            });

            osmLayer.addTo(map);
            const baseLayers = {
                "Standard (OSM)": osmLayer,
                "Gelände (Topo)": topoLayer,
                "Satellit (Esri)": satelliteLayer,
                "Dunkel (Stadia)": stadiaDarkLayer
            };
            L.control.layers(baseLayers, null, { collapsed: true, position: 'topright' }).addTo(map);

            const geocoderControl = L.Control.geocoder({
                defaultMarkGeocode: false,
                placeholder: 'Ort suchen & direkt hinzufügen...',
                geocoder: L.Control.Geocoder.nominatim(),
                position: 'topleft'
            }).on('markgeocode', function(e) {
                console.log("Geocode-Ergebnis aus Kartensuche ausgewählt:", e.geocode);
                if (e.geocode && e.geocode.name && e.geocode.center) {
                    addWaypoint(e.geocode.name, e.geocode.center);
                    if (geocoderControl._input) { 
                         geocoderControl._input.value = ''; 
                         geocoderControl._clearResults(); 
                    }
                } else {
                    console.warn("Unvollständiges Geocode-Ergebnis aus Kartensuche:", e);
                    alert("Der ausgewählte Ort konnte nicht eindeutig bestimmt werden.");
                }
            }).addTo(map);
            console.log("Geocoder Control (Kartensuche) zur Karte hinzugefügt.");

            map.on('click', handleMapClick);

        } catch (error) {
            console.error("Fehler bei der Karteninitialisierung:", error);
            alert("Fehler bei der Karteninitialisierung. Bitte Konsole prüfen.");
        }
    }

    // 2. Behandlung von Kartenklicks
    function handleMapClick(e) {
        const clickedLatLng = e.latlng;
        if (mapClickPopup) map.closePopup(mapClickPopup);
        if (mapClickTempMarker) map.removeLayer(mapClickTempMarker);
        mapClickTempMarker = L.marker(clickedLatLng, { icon: L.divIcon({className: 'leaflet-pulsing-icon'}) }).addTo(map);
        const popupDiv = document.createElement('div');
        popupDiv.className = 'map-click-popup-content';
        popupDiv.innerHTML = `<p style="margin-bottom:5px;"><strong>Ausgewählter Punkt:</strong><br>Lat: ${clickedLatLng.lat.toFixed(4)}, Lng: ${clickedLatLng.lng.toFixed(4)}</p><p id="geocodedPlaceName" style="font-style:italic; margin-bottom:10px;">Suche Ortsnamen...</p><button id="addMapClickWaypointBtn" class="popup-add-button">Als Wegpunkt hinzufügen</button>`;
        mapClickPopup = L.popup({ minWidth: 220, closeButton: true }).setLatLng(clickedLatLng).setContent(popupDiv).openOn(map);
        const addBtnInPopup = document.getElementById('addMapClickWaypointBtn');
        if(addBtnInPopup){
            addBtnInPopup.onclick = () => {
                const placeNameElement = document.getElementById('geocodedPlaceName');
                let placeName = placeNameElement ? placeNameElement.textContent : `Punkt (${clickedLatLng.lat.toFixed(4)}, ${clickedLatLng.lng.toFixed(4)})`;
                if (placeName === "Suche Ortsnamen..." || placeName.startsWith("Fehler:") || placeName === "Ortsname nicht gefunden.") {
                    placeName = `Punkt (${clickedLatLng.lat.toFixed(4)}, ${clickedLatLng.lng.toFixed(4)})`;
                }
                addWaypoint(placeName, clickedLatLng);
                map.closePopup(mapClickPopup);
                if (mapClickTempMarker) map.removeLayer(mapClickTempMarker);
            };
        }
        const geocoder = L.Control.Geocoder.nominatim();
        geocoder.reverse(clickedLatLng, map.options.crs.scale(map.getZoom()), (results) => {
            const placeNameElement = document.getElementById('geocodedPlaceName');
            if (results && results.length > 0 && results[0] && results[0].name) {
                if(placeNameElement) placeNameElement.textContent = results[0].name;
            } else {
                if(placeNameElement) placeNameElement.textContent = "Ortsname nicht gefunden.";
            }
        }, (error) => {
            const placeNameElement = document.getElementById('geocodedPlaceName');
            if(placeNameElement) placeNameElement.textContent = "Fehler: Ortsname nicht ermittelbar.";
        });
    }

    // Entfernt: Funktion handleAddWaypointFromInput()
    /* 
    function handleAddWaypointFromInput() {
        // ...
    }
    */

    // 4. Allgemeine Funktion zum Hinzufügen eines Wegpunkts
    function addWaypoint(name, latLng) {
        const finalLatLng = (latLng instanceof L.LatLng) ? latLng : L.latLng(latLng.lat, latLng.lng);
        
        waypoints.push({ name: name, latLng: finalLatLng });
        renderWaypointList();
        updateRoute();
    }

    // 5. Wegpunktliste rendern
    function renderWaypointList() {
        waypointListUI.innerHTML = '';
        waypoints.forEach((wp, index) => {
            const li = document.createElement('li'); li.dataset.index = index;
            const nameContainer = document.createElement('div'); nameContainer.className = 'waypoint-name-container';
            const nameSpan = document.createElement('span'); nameSpan.className = 'waypoint-name'; nameSpan.textContent = wp.name; nameSpan.title = "Klicken zum Bearbeiten";
            const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'waypoint-name-input'; nameInput.value = wp.name; nameInput.style.display = 'none';
            nameSpan.onclick = () => { nameSpan.style.display = 'none'; nameInput.style.display = 'inline-block'; nameInput.focus(); nameInput.select(); };
            const saveName = () => {
                const newName = nameInput.value.trim();
                if (newName && newName !== wp.name) { waypoints[index].name = newName;
                } else if (!newName && wp.name.trim() !== "") { nameInput.value = wp.name;
                } else if (!newName || newName.trim() === "") { waypoints[index].name = `Punkt (${wp.latLng.lat.toFixed(2)}, ${wp.latLng.lng.toFixed(2)})`; }
                nameSpan.textContent = waypoints[index].name; nameInput.style.display = 'none'; nameSpan.style.display = 'inline-block'; updateRoute();
            };
            nameInput.onblur = saveName; nameInput.onkeypress = (e) => { if (e.key === 'Enter') { e.preventDefault(); nameInput.blur(); } else if (e.key === 'Escape') { nameInput.value = wp.name; nameInput.blur(); }};
            nameContainer.appendChild(nameSpan); nameContainer.appendChild(nameInput); li.appendChild(nameContainer);
            const controlsDiv = document.createElement('div'); controlsDiv.className = 'waypoint-controls';
            const upBtn = document.createElement('button'); upBtn.className = 'move-waypoint move-up'; upBtn.innerHTML = '&uarr;'; upBtn.title = "Nach oben"; upBtn.disabled = (index === 0); upBtn.onclick = () => moveWaypoint(index, -1); controlsDiv.appendChild(upBtn);
            const downBtn = document.createElement('button'); downBtn.className = 'move-waypoint move-down'; downBtn.innerHTML = '&darr;'; downBtn.title = "Nach unten"; downBtn.disabled = (index === waypoints.length - 1); downBtn.onclick = () => moveWaypoint(index, 1); controlsDiv.appendChild(downBtn);
            const deleteBtn = document.createElement('button'); deleteBtn.className = 'delete-waypoint'; deleteBtn.innerHTML = '&times;'; deleteBtn.title = "Wegpunkt löschen"; deleteBtn.onclick = () => { waypoints.splice(index, 1); renderWaypointList(); updateRoute(); }; controlsDiv.appendChild(deleteBtn);
            li.appendChild(controlsDiv); waypointListUI.appendChild(li);
        });
    }
    function moveWaypoint(index, direction) { 
        if (direction === -1 && index > 0) { [waypoints[index], waypoints[index - 1]] = [waypoints[index - 1], waypoints[index]]; } 
        else if (direction === 1 && index < waypoints.length - 1) { [waypoints[index], waypoints[index + 1]] = [waypoints[index + 1], waypoints[index]]; }
        renderWaypointList(); updateRoute();
    }

    function displayRouteInfo() {
        if (rawTotalDistanceMeters > 0) {
            let distance = rawTotalDistanceMeters;
            let unitLabel = 'km';

            if (currentUnitSystem === 'imperial') {
                distance = distance * METERS_TO_MILES;
                unitLabel = 'mi';
            } else { // metric
                distance = distance / 1000;
            }
            if (totalDistanceEl) totalDistanceEl.textContent = `${distance.toFixed(2)} ${unitLabel}`;
            if (totalTimeEl) totalTimeEl.textContent = formatTime(rawTotalTimeSeconds);
        } else {
            if (totalDistanceEl) totalDistanceEl.textContent = '--';
            if (totalTimeEl) totalTimeEl.textContent = '--';
        }
    }

    // 6. Route aktualisieren / Routenplanung initialisieren
    function updateRoute() {
        console.log("updateRoute() aufgerufen.");
        if (waypoints.length < 2) {
            if (routingControl) {
                map.removeControl(routingControl);
                routingControl = null;
            }
            rawTotalDistanceMeters = 0;
            rawTotalTimeSeconds = 0;
            displayRouteInfo();
            return;
        }

        const lrmWaypoints = waypoints.map(wp => L.Routing.waypoint(wp.latLng, wp.name));

        if (!routingControl) {
            routingControl = L.Routing.control({
                waypoints: lrmWaypoints,
                routeWhileDragging: true,
                draggableWaypoints: true,
                addWaypoints: false,
                geocoder: L.Control.Geocoder.nominatim(),
                lineOptions: { styles: [{ color: 'blue', opacity: 0.8, weight: 6 }] },
                show: true,
                fitSelectedRoutes: true,
                createMarker: function(i, waypoint, n) { 
                    return L.marker(waypoint.latLng, { draggable: true, title: waypoint.name }).bindPopup(waypoint.name); 
                }
            }).addTo(map);

            routingControl.on('routesfound', function(e) {
                console.log("routesfound Event von LRM:", e);
                const routes = e.routes;
                if (routes.length > 0) {
                    const summary = routes[0].summary;
                    rawTotalDistanceMeters = summary.totalDistance;
                    rawTotalTimeSeconds = summary.totalTime;
                    displayRouteInfo();
                }
            });

            routingControl.on('waypointschanged', function(e) {
                console.log("waypointschanged Event von LRM:", e);
                if (e.waypoints.length === waypoints.length) {
                    let changedByLRM = false;
                    for (let i = 0; i < e.waypoints.length; i++) {
                        if (!e.waypoints[i].latLng.equals(waypoints[i].latLng) || 
                            (e.waypoints[i].name && e.waypoints[i].name !== waypoints[i].name)) {
                            changedByLRM = true; break;
                        }
                    }
                    if (changedByLRM) {
                        waypoints = e.waypoints.map(lrm_wp => ({
                            name: lrm_wp.name || waypoints.find(wp_1 => wp_1.latLng.equals(lrm_wp.latLng))?.name || `Punkt (${lrm_wp.latLng.lat.toFixed(4)}, ${lrm_wp.latLng.lng.toFixed(4)})`,
                            latLng: lrm_wp.latLng
                        }));
                        renderWaypointList(); 
                    }
                } else if (e.waypoints.length !== waypoints.length && e.waypoints.length > 0) { 
                    waypoints = e.waypoints.map(lrm_wp => ({
                        name: lrm_wp.name || `Punkt (${lrm_wp.latLng.lat.toFixed(4)}, ${lrm_wp.latLng.lng.toFixed(4)})`,
                        latLng: lrm_wp.latLng
                    }));
                    renderWaypointList();
                }
            });

        } else {
            console.log("Aktualisiere Wegpunkte im bestehenden Routing Control.");
            routingControl.setWaypoints(lrmWaypoints);
        }
    }
    
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        let timeString = '';
        if (hours > 0) timeString += `${hours} Std. `;
        if (minutes > 0 || hours === 0) timeString += `${minutes} Min.`;
        return timeString.trim() || '0 Min.';
    }

    // 8. JSON Export / Import
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            if (waypoints.length === 0) { alert("Keine Wegpunkte zum Exportieren vorhanden."); return; }
            const exportData = { routeName: "Meine Roadtrip Route", createdAt: new Date().toISOString(), waypoints: waypoints.map(wp => ({ name: wp.name, lat: wp.latLng.lat, lng: wp.latLng.lng })) };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", `roadtrip_route_${Date.now()}.json`);
            document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
        });
    }
    if (importJsonInput) {
        importJsonInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        if (importedData && Array.isArray(importedData.waypoints)) {
                            waypoints = importedData.waypoints.map(wp => ({ name: wp.name, latLng: L.latLng(wp.lat, wp.lng) }));
                            renderWaypointList(); updateRoute(); alert("Route erfolgreich importiert!");
                        } else { alert("Ungültiges JSON-Format."); }
                    } catch (error) { alert("Fehler beim Lesen der JSON-Datei: " + error.message); }
                };
                reader.readAsText(file); importJsonInput.value = '';
            }
        });
    }

    // 9. PDF Export
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            if (waypoints.length === 0) {
                alert("Keine Wegpunkte für PDF-Export.");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Roadtrip Wegpunkte", 14, 20);
            doc.setFontSize(10);
            let y = 30;
            waypoints.forEach((wp, index) => { 
                if (y > 270) { doc.addPage(); y = 20; }
                doc.text(`${index + 1}. ${wp.name} (Lat: ${wp.latLng.lat.toFixed(4)}, Lng: ${wp.latLng.lng.toFixed(4)})`, 14, y);
                y += 7;
            });

            if (rawTotalDistanceMeters > 0) {
                if (y > 260) { doc.addPage(); y = 20; }
                y += 10;
                
                let distanceForPdf = rawTotalDistanceMeters;
                let unitLabelForPdf = 'km';
                if (currentUnitSystem === 'imperial') {
                    distanceForPdf = distanceForPdf * METERS_TO_MILES;
                    unitLabelForPdf = 'mi';
                } else {
                    distanceForPdf = distanceForPdf / 1000;
                }
                doc.text(`Distanz: ${distanceForPdf.toFixed(2)} ${unitLabelForPdf}`, 14, y);
                y += 7;
                doc.text(`Zeit: ${formatTime(rawTotalTimeSeconds)}`, 14, y);
            }
            doc.save(`roadtrip_${Date.now()}.pdf`);
        });
    }
    
    // 10. Live Standort
    if(showLocationBtn) {
        showLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) { alert("Geolocation wird von Ihrem Browser nicht unterstützt."); return; }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                    L.marker(userLatLng).addTo(map).bindPopup(`Dein Standort (Genauigkeit: ${position.coords.accuracy.toFixed(0)}m)`).openPopup();
                    map.setView(userLatLng, 13);
                },
                (error) => alert(`Fehler beim Abrufen des Standorts: ${error.message}`),
                { enableHighAccuracy: true }
            );
        });
    }

    if (unitSystemSelect) {
        unitSystemSelect.addEventListener('change', (e) => {
            currentUnitSystem = e.target.value;
            console.log("Einheit geändert zu:", currentUnitSystem);
            displayRouteInfo();
        });
    }

    // Entfernt: Event Listener für die alte Suchleiste
    /*
    if(addWaypointBtn) addWaypointBtn.addEventListener('click', handleAddWaypointFromInput);
    if(waypointInput) waypointInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddWaypointFromInput();
    });
    */

    initMap();
    renderWaypointList(); 
    displayRouteInfo();

    console.log("Leaflet-Skript vollständig ausgeführt.");
});