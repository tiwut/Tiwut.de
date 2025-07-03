document.addEventListener('DOMContentLoaded', () => {
    const produktTableBody = document.getElementById('produktTable').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('searchInput');
    const searchCategorySelect = document.getElementById('searchCategory');
    const searchButton = document.getElementById('searchButton');
    const resetSearchButton = document.getElementById('resetSearchButton');

    const addButton = document.getElementById('addButton');
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');
    
    const jsonFileInput = document.getElementById('jsonFileInput');
    const downloadJsonButton = document.getElementById('downloadJsonButton');
    const lastLoadedFileDisplay = document.getElementById('lastLoadedFile');

    const modal = document.getElementById('produktModal');
    const modalTitle = document.getElementById('modalTitle');
    const produktForm = document.getElementById('produktForm');
    const closeButton = document.querySelector('.close-button');
    const cancelModalButton = document.getElementById('cancelModalButton');
    
    const produktIdInput = document.getElementById('produktId');
    const produktnameInput = document.getElementById('produktname');
    const lagerplatzInput = document.getElementById('lagerplatz');
    const stueckzahlInput = document.getElementById('stueckzahl');
    const zustandInput = document.getElementById('zustand');
    const markeInput = document.getElementById('marke');
    const eigenschaftenInput = document.getElementById('eigenschaften');
    const hashtagsInput = document.getElementById('hashtags');

    let produkteData = [];
    let selectedProductId = null;
    let currentEditProdukt = null;
    let unsavedChanges = false;

    function generateUUID() { 
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function getCurrentTimestamp() {
        const now = new Date();
        const YYYY = now.getFullYear();
        const MM = String(now.getMonth() + 1).padStart(2, '0');
        const DD = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    }

    function setUnsavedChanges(status) {
        unsavedChanges = status;
        if (status) {
            downloadJsonButton.classList.add('unsaved');
            downloadJsonButton.textContent = "Änderungen herunterladen*";
        } else {
            downloadJsonButton.classList.remove('unsaved');
            downloadJsonButton.textContent = "Änderungen als JSON herunterladen";
        }
    }
    
    jsonFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (unsavedChanges) {
                if (!confirm("Es gibt ungespeicherte Änderungen. Möchten Sie trotzdem eine neue Datei laden? Ungespeicherte Änderungen gehen verloren.")) {
                    jsonFileInput.value = "";
                    return;
                }
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    if (Array.isArray(jsonData)) {
                        produkteData = jsonData;
                        renderTable();
                        lastLoadedFileDisplay.textContent = `Geladen: ${file.name} (${new Date().toLocaleTimeString()})`;
                        setUnsavedChanges(false);
                        alert(`"${file.name}" erfolgreich geladen.`);
                    } else {
                        alert("Fehler: Die JSON-Datei enthält kein Array von Produkten.");
                    }
                } catch (error) {
                    alert(`Fehler beim Parsen der JSON-Datei: ${error.message}`);
                    console.error("JSON Parse Error:", error);
                }
            };
            reader.onerror = () => {
                alert("Fehler beim Lesen der Datei.");
            };
            reader.readAsText(file);
        }
    });

    downloadJsonButton.addEventListener('click', () => {
        if (produkteData.length === 0) {
            alert("Es gibt keine Daten zum Herunterladen.");
            return;
        }
        const jsonDataStr = JSON.stringify(produkteData, null, 4);
        const blob = new Blob([jsonDataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lager_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setUnsavedChanges(false);
        alert("Die Datei 'lager_data.json' wird heruntergeladen. Bitte speichern Sie sie an einem geeigneten Ort (z.B. überschreiben Sie die alte Datei).");
    });

    function renderTable(filterFn = null) {
        produktTableBody.innerHTML = ''; 
        const dataToRender = filterFn ? produkteData.filter(filterFn) : produkteData;

        dataToRender.forEach(produkt => {
            const row = produktTableBody.insertRow();
            row.setAttribute('data-id', produkt.id);

            row.insertCell().textContent = produkt.produktname || '';
            row.insertCell().textContent = produkt.lagerplatz || '';
            row.insertCell().textContent = produkt.stueckzahl !== undefined ? produkt.stueckzahl : '';
            row.insertCell().textContent = produkt.zustand || '';
            row.insertCell().textContent = produkt.letzte_aktualisierung || '';
            row.insertCell().textContent = produkt.marke || '';
            row.insertCell().textContent = produkt.eigenschaften || '';
            row.insertCell().textContent = produkt.hashtags || '';

            row.addEventListener('click', () => selectRow(row, produkt.id));
            row.addEventListener('dblclick', () => openEditModal(produkt));
        });
        updateButtonStates();
    }

    function selectRow(row, produktId) {
        const previouslySelected = document.querySelector('#produktTable tbody tr.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        if (selectedProductId === produktId) { 
            selectedProductId = null;
        } else {
            row.classList.add('selected');
            selectedProductId = produktId;
        }
        updateButtonStates();
    }
    
    function updateButtonStates() {
        if (selectedProductId) {
            editButton.disabled = false;
            deleteButton.disabled = false;
        } else {
            editButton.disabled = true;
            deleteButton.disabled = true;
        }
    }

    function openModal(title, produkt = null) {
        modalTitle.textContent = title;
        currentEditProdukt = produkt;
        produktForm.reset(); 

        if (produkt) { 
            produktIdInput.value = produkt.id;
            produktnameInput.value = produkt.produktname || '';
            lagerplatzInput.value = produkt.lagerplatz || '';
            stueckzahlInput.value = produkt.stueckzahl !== undefined ? produkt.stueckzahl : 0;
            zustandInput.value = produkt.zustand || 'Neu';
            markeInput.value = produkt.marke || '';
            eigenschaftenInput.value = produkt.eigenschaften || '';
            hashtagsInput.value = produkt.hashtags || '';
        } else { 
            produktIdInput.value = ''; 
            zustandInput.value = 'Neu'; 
            stueckzahlInput.value = 0;
        }
        modal.style.display = 'block';
        produktnameInput.focus();
    }

    function closeModal() {
        modal.style.display = 'none';
        currentEditProdukt = null;
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const produkt = {
            id: produktIdInput.value || generateUUID(), 
            produktname: produktnameInput.value.trim(),
            lagerplatz: lagerplatzInput.value.trim(),
            stueckzahl: parseInt(stueckzahlInput.value, 10),
            zustand: zustandInput.value,
            marke: markeInput.value.trim(),
            eigenschaften: eigenschaftenInput.value.trim(),
            hashtags: hashtagsInput.value.trim(),
            letzte_aktualisierung: getCurrentTimestamp()
        };

        if (!produkt.produktname) {
            alert("Produktname ist erforderlich.");
            return;
        }
        if (isNaN(produkt.stueckzahl) || produkt.stueckzahl < 0) {
            alert("Stückzahl muss eine nicht-negative Zahl sein.");
            return;
        }

        if (currentEditProdukt) { 
            const index = produkteData.findIndex(p => p.id === produkt.id);
            if (index > -1) {
                produkteData[index] = produkt;
            }
        } else { 
            produkteData.push(produkt);
        }
        setUnsavedChanges(true);
        renderTable();
        closeModal();
    }

    function addProdukt() {
        openModal('Neues Produkt hinzufügen');
    }

    function openEditModal(produkt = null) {
        const produktToEdit = produkt || produkteData.find(p => p.id === selectedProductId);
        if (produktToEdit) {
            openModal('Produkt bearbeiten', produktToEdit);
        } else {
            alert("Bitte wählen Sie ein Produkt zum Bearbeiten aus.");
        }
    }
    
    function deleteProdukt() {
        if (!selectedProductId) {
            alert("Bitte wählen Sie ein Produkt zum Löschen aus.");
            return;
        }
        const produktToDelete = produkteData.find(p => p.id === selectedProductId);
        if (confirm(`Möchten Sie "${produktToDelete.produktname}" wirklich löschen?`)) {
            produkteData = produkteData.filter(p => p.id !== selectedProductId);
            selectedProductId = null; 
            setUnsavedChanges(true);
            renderTable();
        }
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = searchCategorySelect.value;

        if (!searchTerm) {
            renderTable();
            return;
        }

        const filterFn = (produkt) => {
            const checkValue = (value) => value && String(value).toLowerCase().includes(searchTerm);

            if (category === 'alle') {
                return checkValue(produkt.produktname) ||
                       checkValue(produkt.lagerplatz) ||
                       checkValue(produkt.marke) ||
                       checkValue(produkt.eigenschaften) ||
                       checkValue(produkt.hashtags) ||
                       checkValue(produkt.zustand);
            } else if (category === 'stueckzahl') { 
                 return produkt.stueckzahl !== undefined && String(produkt.stueckzahl).includes(searchTerm);
            }
            return checkValue(produkt[category]);
        };
        renderTable(filterFn);
    }

    addButton.addEventListener('click', addProdukt);
    editButton.addEventListener('click', () => openEditModal());
    deleteButton.addEventListener('click', deleteProdukt);
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    resetSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        searchCategorySelect.value = 'alle';
        renderTable();
    });

    closeButton.addEventListener('click', closeModal);
    cancelModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { 
        if (event.target === modal) {
            closeModal();
        }
    });
    produktForm.addEventListener('submit', handleFormSubmit);

    window.addEventListener('beforeunload', (event) => {
        if (unsavedChanges) {
            event.preventDefault();
            event.returnValue = '';
            return "Es gibt ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?";
        }
    });

    renderTable(); 
    lastLoadedFileDisplay.textContent = "Noch keine Datei geladen. Bitte 'lager_data.json' auswählen.";
});