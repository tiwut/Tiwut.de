// app.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elemente
    const paletteContainer = document.getElementById('palette-categories');
    const iframe = document.getElementById('canvas-iframe');
    let iframeDoc; // Wird nach dem Laden des Iframes gesetzt
    let iframeBody;
    const inspectorContent = document.getElementById('inspector-content');
    const searchInput = document.getElementById('search-elements');
    const exportHtmlButton = document.getElementById('btn-export-html');
    const exportPhpButton = document.getElementById('btn-export-php');
    const saveProjectButton = document.getElementById('btn-save-project');
    const loadProjectInput = document.getElementById('load-project-input');
    const newProjectButton = document.getElementById('btn-new-project');
    const previewTabButton = document.getElementById('btn-preview-tab');

    const undoButton = document.getElementById('btn-undo');
    const redoButton = document.getElementById('btn-redo');

    const responsiveControls = document.getElementById('responsive-controls');
    const iframeWrapper = document.getElementById('iframe-wrapper');

    const themeToggleButton = document.getElementById('btn-toggle-theme');
    const pageSettingsButton = document.getElementById('btn-page-settings');
    const pageSettingsModal = document.getElementById('page-settings-modal');
    const savePageSettingsButton = document.getElementById('btn-save-page-settings');
    const closeModalButtons = document.querySelectorAll('.modal .close-button');

    const templateModal = document.getElementById('template-selection-modal');
    const templateSelect = document.getElementById('template-select');
    const loadTemplateButton = document.getElementById('btn-load-template');


    // Anwendungszustand
    let editorState = {
        pageSettings: {
            pageTitle: "Meine Webseite",
            metaDescription: "",
            googleFont: "",
            customCSS: ""
        },
        canvasElements: [] // Hier werden die Element-Daten gespeichert (nicht die DOM-Nodes selbst)
    };
    let selectedElementData = null; // Das Datenobjekt des ausgewählten Elements
    let draggedElementDefinition = null; // Definition des Elements, das von der Palette gezogen wird

    const history = [];
    let historyIndex = -1;
    const MAX_HISTORY = 20;

    // ---- Initialisierung ----
    function init() {
        loadPaletteElements();
        setupEventListeners();
        loadInitialProject(); // Lädt leeres Projekt oder aus localStorage
        updateUndoRedoButtons();

        // Warten bis iframe geladen ist
        iframe.addEventListener('load', () => {
            iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeBody = iframeDoc.body;
            if (!iframeBody) {
                console.error("iframeBody konnte nicht gefunden werden!");
                return;
            }
            iframeBody.id = 'page-body'; // Wichtig für spätere Referenzen
            setupIframeEventListeners();
            renderCanvasFromState(); // Canvas neu rendern, wenn iframe geladen ist
            applyPageSettingsToIframe();
        });
    }

    function loadInitialProject() {
        // Hier könnte man später aus localStorage laden
        // Fürs Erste: Neues, leeres Projekt oder Standard-Vorlage
        // newProject(true); // true, um keine Bestätigung zu zeigen
        showTemplateModal(); // Biete Vorlagen beim Start an
    }

    function showTemplateModal() {
        templateModal.style.display = 'block';
    }


    // ---- Seiteneinstellungen ----
    function openPageSettingsModal() {
        document.getElementById('page-title').value = editorState.pageSettings.pageTitle;
        document.getElementById('page-meta-description').value = editorState.pageSettings.metaDescription;
        document.getElementById('page-google-font').value = editorState.pageSettings.googleFont;
        document.getElementById('custom-css').value = editorState.pageSettings.customCSS;
        pageSettingsModal.style.display = 'block';
    }

    function closePageSettingsModal() {
        pageSettingsModal.style.display = 'none';
    }

    function handleSavePageSettings() {
        editorState.pageSettings.pageTitle = document.getElementById('page-title').value;
        editorState.pageSettings.metaDescription = document.getElementById('page-meta-description').value;
        editorState.pageSettings.googleFont = document.getElementById('page-google-font').value;
        editorState.pageSettings.customCSS = document.getElementById('custom-css').value;
        applyPageSettingsToIframe();
        saveStateToHistory("Seiteneinstellungen geändert");
        closePageSettingsModal();
    }

    function applyPageSettingsToIframe() {
        if (!iframeDoc) return;
        // Google Font
        const fontStyleEl = iframeDoc.getElementById('google-font-style');
        if (fontStyleEl) {
            if (editorState.pageSettings.googleFont) {
                const fontName = editorState.pageSettings.googleFont.replace(/\s+/g, '+');
                fontStyleEl.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;700&display=swap');`;
                iframeBody.style.fontFamily = `'${editorState.pageSettings.googleFont}', sans-serif`;
            } else {
                fontStyleEl.innerHTML = '';
                iframeBody.style.fontFamily = ''; // Reset
            }
        }
        // Custom CSS
        const customStyleEl = iframeDoc.getElementById('global-custom-styles');
        if (customStyleEl) {
            customStyleEl.textContent = editorState.pageSettings.customCSS;
        }
    }

    // ---- Element-Palette ----
    function loadPaletteElements(filter = '') {
        paletteContainer.innerHTML = '';
        const categories = {};

        WEB_ELEMENTS
            .filter(el => el.name.toLowerCase().includes(filter.toLowerCase()) ||
                          (el.category && el.category.toLowerCase().includes(filter.toLowerCase())) ||
                          (el.htmlTag && el.htmlTag.toLowerCase().includes(filter.toLowerCase()))
            )
            .forEach(el => {
                if (!categories[el.category]) categories[el.category] = [];
                categories[el.category].push(el);
            });

        for (const categoryName in categories) {
            const categoryTitle = document.createElement('h4');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = categoryName;
            paletteContainer.appendChild(categoryTitle);

            categories[categoryName].forEach(elDef => {
                const div = document.createElement('div');
                div.className = 'palette-element';
                div.innerHTML = `<span class="icon">${elDef.icon || ''}</span> ${elDef.name}`;
                div.draggable = true;
                div.dataset.elementId = elDef.id;
                div.addEventListener('dragstart', (e) => handleDragStart(e, elDef));
                paletteContainer.appendChild(div);
            });
        }
    }

    // ---- Drag & Drop ----
    function handleDragStart(event, elDef) {
        draggedElementDefinition = elDef;
        event.dataTransfer.setData('text/plain', elDef.id);
        event.dataTransfer.effectAllowed = 'copy';
    }

    function setupIframeEventListeners() {
        if (!iframeBody) return;
        iframeBody.addEventListener('dragover', handleDragOver);
        iframeBody.addEventListener('dragleave', handleDragLeave);
        iframeBody.addEventListener('drop', handleDrop);
        iframeBody.addEventListener('click', handleIframeBodyClick); // Für Deselektion
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        // Highlight potenzielles Drop-Target
        let target = event.target.closest('[data-canvas-id], .col-flex, #page-body'); // Auch Spalten und Body als Ziel
        if (target) {
            if (target.id === 'page-body' || (target.dataset.canvasId && WEB_ELEMENTS.find(e=>e.id === editorState.canvasElements.find(c => c.id === target.dataset.canvasId)?.definitionId)?.canHaveChildren) || target.classList.contains('col-flex')) {
                target.classList.add('drop-target-highlight');
            }
        }
    }

    function handleDragLeave(event) {
        let target = event.target.closest('[data-canvas-id], .col-flex, #page-body');
        if (target) {
            target.classList.remove('drop-target-highlight');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        if (!draggedElementDefinition || !iframeBody) return;

        let dropTarget = event.target.closest('[data-canvas-id], .col-flex, #page-body');
        if (dropTarget) dropTarget.classList.remove('drop-target-highlight');
        else dropTarget = iframeBody; // Fallback auf Body

        const parentElementData = dropTarget.id === 'page-body' ? null : editorState.canvasElements.find(el => el.id === dropTarget.dataset.canvasId);
        const parentDefinition = parentElementData ? WEB_ELEMENTS.find(d => d.id === parentElementData.definitionId) : null;

        // Nur in Container oder direkt in Body droppen, wenn das Element es erlaubt oder es das Body ist
        const canDropInTarget = dropTarget.id === 'page-body' ||
                                dropTarget.classList.contains('col-flex') || // Spalten sind immer Drop-Ziele
                                (parentElementData && parentDefinition && parentDefinition.canHaveChildren);

        if (!canDropInTarget && dropTarget.id !== 'page-body' && !dropTarget.classList.contains('col-flex')) {
            // Versuche, zum nächsten gültigen Parent zu gehen
            dropTarget = dropTarget.parentElement.closest('[data-canvas-id], .col-flex, #page-body') || iframeBody;
        }

        const newElementData = createElementDataFromDefinition(draggedElementDefinition);

        if (draggedElementDefinition.isBlock) {
            // Füge alle Elemente des Blocks ein
            draggedElementDefinition.structure.forEach(blockElementDef => {
                const blockElData = createStructuredElementData(blockElementDef);
                insertElementData(blockElData, dropTarget.dataset.canvasId || null, dropTarget.classList.contains('col-flex') ? dropTarget : null);
            });
        } else {
            insertElementData(newElementData, dropTarget.dataset.canvasId || null, dropTarget.classList.contains('col-flex') ? dropTarget : null);
        }

        renderCanvasFromState();
        selectElementInCanvas(newElementData.id); // Das erste Element des Blocks oder das einzelne Element
        saveStateToHistory(`Element '${draggedElementDefinition.name}' hinzugefügt`);
        draggedElementDefinition = null;
    }

    function createStructuredElementData(elementConfig, parentId = null) {
        const definition = WEB_ELEMENTS.find(def => def.id === elementConfig.definitionId);
        if (!definition) {
            console.error("Definition nicht gefunden für Block-Element:", elementConfig.definitionId);
            return null;
        }
        const newId = `canvas-el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const elementData = {
            id: newId,
            definitionId: definition.id,
            properties: { ...cloneObject(definition.defaultAttributes), ...cloneObject(elementConfig.properties) },
            styles: { ...cloneObject(definition.defaultStyles), ...cloneObject(elementConfig.styles) }, // Falls Stile im Block definiert
            content: definition.defaultContent || '',
            children: []
        };
         if (elementConfig.properties && elementConfig.properties.textContent) {
            elementData.content = elementConfig.properties.textContent;
        }


        if (elementConfig.children && definition.canHaveChildren) {
            elementData.children = elementConfig.children.map(childConfig => createStructuredElementData(childConfig, newId));
        }
        return elementData;
    }


    function insertElementData(elementData, parentCanvasId, parentDomElementForColumn) {
        if (parentDomElementForColumn && parentDomElementForColumn.classList.contains('col-flex')) {
            // Spezialfall: In Spalte einfügen (Spalten sind nicht Teil von editorState.canvasElements)
            // Finde den Parent der Spaltenreihe und dann die richtige Spalte zum Einfügen. Kompliziert.
            // Vereinfachung: Wir fügen direkt dem DOM hinzu und hoffen, dass renderCanvasFromState das später korrekt abbildet.
            // Besser wäre, Spalten auch im editorState abzubilden.
            // Für diese "leichte" Version fügen wir es einfach dem editorState auf oberster Ebene hinzu.
            // Beim Rendern muss dann die Logik die Spalten finden.
             editorState.canvasElements.push(elementData); // Nicht ideal, aber einfacher für den Start
        } else if (parentCanvasId) {
            const parentData = findElementDataById(editorState.canvasElements, parentCanvasId);
            if (parentData && WEB_ELEMENTS.find(d => d.id === parentData.definitionId)?.canHaveChildren) {
                if (!parentData.children) parentData.children = [];
                parentData.children.push(elementData);
            } else {
                editorState.canvasElements.push(elementData); // Fallback auf Root
            }
        } else {
            editorState.canvasElements.push(elementData);
        }
    }

    function findElementDataById(elementsArray, id) {
        for (const el of elementsArray) {
            if (el.id === id) return el;
            if (el.children && el.children.length > 0) {
                const foundInChildren = findElementDataById(el.children, id);
                if (foundInChildren) return foundInChildren;
            }
        }
        return null;
    }


    function createElementDataFromDefinition(elDef) {
        return {
            id: `canvas-el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            definitionId: elDef.id,
            properties: cloneObject(elDef.defaultAttributes || {}),
            styles: cloneObject(elDef.defaultStyles || {}),
            content: elDef.defaultContent || '', // Für Elemente ohne Kinder
            children: elDef.canHaveChildren ? [] : undefined
        };
    }

    // ---- Canvas Rendering ----
    function renderCanvasFromState() {
        if (!iframeBody) {
            console.warn("iframeBody noch nicht bereit für Rendering.");
            return;
        }
        iframeBody.innerHTML = ''; // Canvas leeren
        if (editorState.canvasElements.length === 0) {
            iframeBody.innerHTML = '<p>Ziehe Elemente aus der Palette hierher.</p>';
        } else {
            editorState.canvasElements.forEach(elData => {
                const domElement = createDOMElementFromData(elData, iframeDoc);
                if (domElement) iframeBody.appendChild(domElement);
            });
        }
        // Nach dem Rendern erneut den Selektionsstatus anwenden, falls vorhanden
        if (selectedElementData) {
            const domEl = iframeDoc.querySelector(`[data-canvas-id="${selectedElementData.id}"]`);
            if (domEl) domEl.classList.add('selected-element-iframe');
        }
    }

    function createDOMElementFromData(elementData, doc) {
        const definition = WEB_ELEMENTS.find(def => def.id === elementData.definitionId);
        if (!definition) return null;

        let el;
        if (definition.generateStructure) { // Für komplexe Elemente wie Spalten
            el = doc.createElement(definition.htmlTag || 'div');
            if (definition.className) el.className = definition.className; // Klasse für Row-Flex
            el.innerHTML = definition.generateStructure();
             // Wichtig: Kind-Elemente, die in die Spalten gedroppt werden, müssen hier separat behandelt werden.
            // Dies ist ein Schwachpunkt der vereinfachten Struktur.
            // In einer robusten Lösung hätten Spalten selbst einen "children" Array in editorState.
        } else {
            el = doc.createElement(definition.htmlTag);
        }

        el.dataset.canvasId = elementData.id; // Wichtig für Selektion und Inspektor

        // Attribute setzen
        for (const attr in elementData.properties) {
            if (elementData.properties[attr] !== undefined && elementData.properties[attr] !== null && elementData.properties[attr] !== '') {
                if (attr === 'className') el.className = `${el.className || ''} ${elementData.properties[attr]}`.trim();
                else if (attr === 'required' && typeof elementData.properties[attr] === 'boolean') {
                    if (elementData.properties[attr]) el.setAttribute(attr, ''); else el.removeAttribute(attr);
                }
                else el.setAttribute(attr, elementData.properties[attr]);
            }
        }
        // Stile setzen
        for (const styleProp in elementData.styles) {
            if (elementData.styles[styleProp]) {
                el.style[styleProp] = elementData.styles[styleProp];
            }
        }
        // Inhalt für Elemente ohne Kinder
        if (!definition.canHaveChildren && elementData.content) {
            el.textContent = elementData.content;
        }

        // Klick-Handler für Selektion hinzufügen
        el.addEventListener('click', (e) => {
            e.stopPropagation(); // Verhindert, dass Klick auf Body durchgeht
            selectElementInCanvas(elementData.id);
        });

        // Rekursiv Kinder rendern, falls vorhanden und erlaubt
        if (definition.canHaveChildren && elementData.children && elementData.children.length > 0) {
            let targetForChildren = el;
            // Spezialbehandlung für Spalten: Kinder in die .col-flex divs einfügen
            if (definition.id === 'columns_2') { // Oder andere Spalten-Layouts
                const cols = Array.from(el.querySelectorAll('.col-flex'));
                // Hier müsste eine Logik her, wie Kinder auf Spalten verteilt werden.
                // Vereinfachung: Alle Kinder in die erste Spalte oder abwechselnd.
                elementData.children.forEach((childData, index) => {
                    const childDOM = createDOMElementFromData(childData, doc);
                    if (childDOM && cols[index % cols.length]) { // Abwechselnd in Spalten
                        cols[index % cols.length].appendChild(childDOM);
                    } else if (childDOM && cols.length > 0) { // Fallback: erste Spalte
                         cols[0].appendChild(childDOM);
                    }
                });
            } else {
                 elementData.children.forEach(childData => {
                    const childDOM = createDOMElementFromData(childData, doc);
                    if (childDOM) targetForChildren.appendChild(childDOM);
                });
            }
        }
        return el;
    }


    // ---- Element Selektion & Inspektor ----
    function handleIframeBodyClick(event) {
        // Wenn direkt auf den Body (oder leeren Bereich im Body) geklickt wird, deselektieren
        if (event.target.id === 'page-body' || event.target.tagName === 'HTML') {
            deselectElement();
        }
    }

    function deselectElement() {
        if (selectedElementData) {
            const prevSelectedDOM = iframeDoc.querySelector(`[data-canvas-id="${selectedElementData.id}"]`);
            if (prevSelectedDOM) prevSelectedDOM.classList.remove('selected-element-iframe');
        }
        selectedElementData = null;
        inspectorContent.innerHTML = '<p>Wähle ein Element aus oder füge eines aus der Palette hinzu.</p>';
    }

    function selectElementInCanvas(elementId) {
        if (selectedElementData && selectedElementData.id === elementId) return; // Bereits ausgewählt

        deselectElement(); // Vorheriges deselektieren

        selectedElementData = findElementDataById(editorState.canvasElements, elementId);
        if (!selectedElementData) {
            console.warn("Ausgewähltes Element nicht im State gefunden:", elementId);
            deselectElement();
            return;
        }

        const domElement = iframeDoc.querySelector(`[data-canvas-id="${elementId}"]`);
        if (domElement) {
            domElement.classList.add('selected-element-iframe');
            loadInspector(selectedElementData);
        } else {
            console.warn("DOM Element für Selektion nicht im Iframe gefunden:", elementId);
            deselectElement(); // Element nicht gefunden, also nichts auswählen
        }
    }


    function loadInspector(elementData) {
        inspectorContent.innerHTML = '';
        const definition = WEB_ELEMENTS.find(el => el.id === elementData.definitionId);
        if (!definition) return;

        const title = document.createElement('h4');
        title.textContent = definition.name;
        inspectorContent.appendChild(title);

        // Eigenschaften (Attribute & Inhalt)
        if (definition.properties) {
            definition.properties.forEach(propDef => {
                createPropertyField(propDef, elementData, 'properties', elementData.properties[propDef.name]);
            });
        }
        // Inhalt für Elemente ohne Kinder, falls nicht schon als 'textContent' in properties
        if (!definition.canHaveChildren && !definition.properties?.find(p=>p.name==='textContent')) {
            createPropertyField(
                { name: 'content', type: 'textarea', label: 'Inhalt' },
                elementData, 'content', elementData.content
            );
        }

        // Stile
        const styleTitle = document.createElement('h5');
        styleTitle.textContent = 'Styling';
        styleTitle.style.marginTop = '20px';
        inspectorContent.appendChild(styleTitle);

        // Erlaube Bearbeitung aller Standardstile, die in defaultStyles des Elements definiert sind
        // oder füge ein paar generische hinzu.
        const commonStyleProps = ['color', 'backgroundColor', 'padding', 'margin', 'fontSize', 'textAlign', 'width', 'height', 'borderRadius'];
        if (definition.defaultStyles) {
            Object.keys(definition.defaultStyles).forEach(styleKey => {
                if (!commonStyleProps.includes(styleKey)) commonStyleProps.push(styleKey);
            });
        }

        commonStyleProps.forEach(styleKey => {
            let type = 'text';
            if (styleKey.toLowerCase().includes('color')) type = 'color';
            if (styleKey === 'textAlign') type = 'select';
            const options = styleKey === 'textAlign' ? ['left', 'center', 'right', 'justify'] : undefined;

            createPropertyField(
                { name: styleKey, type: type, label: camelCaseToLabel(styleKey) + " (Style)", options: options },
                elementData, 'styles', elementData.styles[styleKey]
            );
        });

        // Löschen-Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Element löschen';
        deleteButton.style.marginTop = '20px';
        deleteButton.style.backgroundColor = 'tomato';
        deleteButton.style.color = 'white';
        deleteButton.onclick = () => {
            if (confirm("Element wirklich löschen?")) {
                deleteElement(selectedElementData.id);
            }
        };
        inspectorContent.appendChild(deleteButton);
    }

    function deleteElement(elementId) {
        editorState.canvasElements = removeElementRecursive(editorState.canvasElements, elementId);
        deselectElement();
        renderCanvasFromState();
        saveStateToHistory("Element gelöscht");
    }

    function removeElementRecursive(elementsArray, idToRemove) {
        return elementsArray.filter(el => {
            if (el.id === idToRemove) {
                return false; // Element entfernen
            }
            if (el.children && el.children.length > 0) {
                el.children = removeElementRecursive(el.children, idToRemove);
            }
            return true;
        });
    }


    function createPropertyField(propDef, elementData, targetObjectKey, currentValue) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = propDef.label || propDef.name;
        label.htmlFor = `prop-${elementData.id}-${propDef.name}`;
        container.appendChild(label);

        let input;
        switch (propDef.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.rows = 3;
                break;
            case 'select':
                input = document.createElement('select');
                (propDef.options || []).forEach(opt => {
                    const option = document.createElement('option');
                    option.value = typeof opt === 'string' ? opt : opt.value;
                    option.textContent = typeof opt === 'string' ? (opt || ' (Kein)') : opt.label;
                    input.appendChild(option);
                });
                break;
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = currentValue === true || currentValue === 'true' || currentValue === propDef.name; // Für 'required' etc.
                break;
            default:
                input = document.createElement('input');
                input.type = propDef.type || 'text';
        }
        input.id = `prop-${elementData.id}-${propDef.name}`;
        if (propDef.placeholder) input.placeholder = propDef.placeholder;

        if (propDef.type !== 'checkbox') {
            input.value = currentValue || '';
        }

        input.addEventListener('input', (e) => {
            let value = propDef.type === 'checkbox' ? e.target.checked : e.target.value;

            if (targetObjectKey === 'content') { // Direkt das content-Feld
                 elementData.content = value;
            } else { // properties oder styles Objekt
                if (!elementData[targetObjectKey]) elementData[targetObjectKey] = {};
                elementData[targetObjectKey][propDef.name] = value;
            }

            // Live-Update des DOM-Elements im Iframe
            const domToUpdate = iframeDoc.querySelector(`[data-canvas-id="${elementData.id}"]`);
            if (domToUpdate) {
                const definition = WEB_ELEMENTS.find(def => def.id === elementData.definitionId);
                if (targetObjectKey === 'styles') {
                    domToUpdate.style[propDef.name] = value;
                } else if (targetObjectKey === 'properties') {
                    if (propDef.name === 'className') {
                        // Alte Klassen entfernen, die nicht 'selected-element-iframe' sind
                        const classes = Array.from(domToUpdate.classList).filter(c => c === 'selected-element-iframe');
                        domToUpdate.className = classes.join(' ');
                        if(value) domToUpdate.classList.add(...value.split(' ').filter(s => s)); // Neue Klassen hinzufügen
                    } else if (propDef.name === 'required' && typeof value === 'boolean') {
                        if(value) domToUpdate.setAttribute(propDef.name, ''); else domToUpdate.removeAttribute(propDef.name);
                    }
                    else if (value) {
                        domToUpdate.setAttribute(propDef.name, value);
                    } else {
                        domToUpdate.removeAttribute(propDef.name);
                    }
                } else if (targetObjectKey === 'content' && definition && !definition.canHaveChildren) {
                    domToUpdate.textContent = value;
                }
            }
            saveStateToHistory("Eigenschaft geändert");
        });
        container.appendChild(input);
        inspectorContent.appendChild(container);
    }

    // ---- Projekt Speichern & Laden & Neu ----
    function newProject(skipConfirm = false) {
        if (!skipConfirm && !confirm("Aktuelles Projekt verwerfen und ein neues starten? Alle nicht gespeicherten Änderungen gehen verloren.")) {
            return;
        }
        editorState = cloneObject(TEMPLATES.blank); // Tief kopieren
        deselectElement();
        renderCanvasFromState();
        applyPageSettingsToIframe(); // Wichtig für Titel etc.
        history.length = 0;
        historyIndex = -1;
        updateUndoRedoButtons();
        saveStateToHistory("Neues Projekt gestartet"); // Initialer Zustand für Undo
        // Schließe Template Modal, falls offen
        if (templateModal.style.display === 'block') templateModal.style.display = 'none';
    }

    function saveProject() {
        const filename = `projekt-${new Date().toISOString().slice(0,10)}.json`;
        const dataStr = JSON.stringify(editorState, null, 2); // null, 2 für pretty print
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Projekt gespeichert als " + filename);
    }

    function loadProject(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedState = JSON.parse(e.target.result);
                    // Validierung wäre hier gut
                    editorState = loadedState;
                    deselectElement();
                    renderCanvasFromState();
                    applyPageSettingsToIframe();
                    history.length = 0;
                    historyIndex = -1;
                    updateUndoRedoButtons();
                    saveStateToHistory("Projekt geladen");
                    alert("Projekt geladen: " + file.name);
                } catch (err) {
                    alert("Fehler beim Laden der Projektdatei: " + err.message);
                }
            };
            reader.readAsText(file);
            event.target.value = null; // Damit gleicher Dateiname erneut geladen werden kann
        }
    }

    function loadSelectedTemplate() {
        const templateKey = templateSelect.value;
        if (TEMPLATES[templateKey]) {
            if (!confirm(`Vorlage "${templateKey.replace('_', ' ')}" laden? Aktueller Inhalt wird überschrieben.`)) {
                return;
            }
            editorState = cloneObject(TEMPLATES[templateKey]); // Tief kopieren
            deselectElement();
            renderCanvasFromState();
            applyPageSettingsToIframe();
            history.length = 0;
            historyIndex = -1;
            updateUndoRedoButtons();
            saveStateToHistory(`Vorlage '${templateKey}' geladen`);
            templateModal.style.display = 'none';
        } else {
            alert("Vorlage nicht gefunden.");
        }
    }


    // ---- Undo / Redo ----
    function saveStateToHistory(actionName = "Aktion") {
        // console.log("Saving state:", actionName, editorState);
        if (historyIndex < history.length - 1) {
            history.splice(historyIndex + 1); // Zukünftige Zustände verwerfen
        }
        history.push(cloneObject(editorState)); // Tiefkopie des Zustands speichern

        if (history.length > MAX_HISTORY) {
            history.shift(); // Ältesten Zustand entfernen
        } else {
            historyIndex++;
        }
        updateUndoRedoButtons();
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            editorState = cloneObject(history[historyIndex]);
            deselectElement();
            renderCanvasFromState();
            applyPageSettingsToIframe(); // Wichtig, da Seiteneinstellungen auch im State sind
            loadInspectorForSelected(); // Inspektor neu laden, falls etwas selektiert war
        }
        updateUndoRedoButtons();
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            editorState = cloneObject(history[historyIndex]);
            deselectElement();
            renderCanvasFromState();
            applyPageSettingsToIframe();
            loadInspectorForSelected();
        }
        updateUndoRedoButtons();
    }

    function updateUndoRedoButtons() {
        undoButton.disabled = historyIndex <= 0;
        redoButton.disabled = historyIndex >= history.length - 1;
    }

    function loadInspectorForSelected() {
        // Finde das Element, das im (jetzt alten) State selektiert war,
        // aber basierend auf der ID, da die Objekte neu sind.
        // Diese Funktion ist knifflig, da die Objektidentitäten sich ändern.
        // Vereinfachung: Wenn vorher ein Element selektiert war, versuche es erneut zu selektieren.
        // Eine robustere Lösung würde die ID des selektierten Elements separat speichern.
        // Für jetzt: Einfach den Inspektor leeren.
        if (selectedElementData) {
            const currentSelectedData = findElementDataById(editorState.canvasElements, selectedElementData.id);
            if (currentSelectedData) {
                selectedElementData = currentSelectedData; // Referenz aktualisieren
                loadInspector(selectedElementData);
                const domEl = iframeDoc.querySelector(`[data-canvas-id="${selectedElementData.id}"]`);
                if (domEl) domEl.classList.add('selected-element-iframe');

            } else {
                deselectElement(); // Das Element existiert vielleicht nicht mehr im aktuellen State
            }
        } else {
            deselectElement();
        }
    }

    // ---- Responsive Ansicht ----
    function setResponsiveView(view) { // view: 'desktop', 'tablet', 'mobile'
        iframeWrapper.classList.remove('desktop-view', 'tablet-view', 'mobile-view');
        responsiveControls.querySelectorAll('button').forEach(b => b.classList.remove('active'));

        if (view === 'desktop') {
            iframeWrapper.classList.add('desktop-view');
            document.getElementById('btn-view-desktop').classList.add('active');
            iframeWrapper.style.width = '100%'; // Oder spezifischer Desktop-Wert
        } else if (view === 'tablet') {
            iframeWrapper.classList.add('tablet-view');
            document.getElementById('btn-view-tablet').classList.add('active');
            iframeWrapper.style.width = '768px';
        } else if (view === 'mobile') {
            iframeWrapper.classList.add('mobile-view');
            document.getElementById('btn-view-mobile').classList.add('active');
            iframeWrapper.style.width = '375px';
        }
    }

    // ---- Export ----
    function generatePageHTML(forPhpExport = false) {
        let html = `<!DOCTYPE html>\n<html lang="de">\n<head>\n`;
        html += `  <meta charset="UTF-8">\n`;
        html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
        html += `  <title>${escapeHtml(editorState.pageSettings.pageTitle)}</title>\n`;
        if (editorState.pageSettings.metaDescription) {
            html += `  <meta name="description" content="${escapeHtml(editorState.pageSettings.metaDescription)}">\n`;
        }
        if (editorState.pageSettings.googleFont) {
            const fontName = editorState.pageSettings.googleFont.replace(/\s+/g, '+');
            html += `  <link href="https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;700&display=swap" rel="stylesheet">\n`;
        }
        html += `  <style>\n`;
        html += `    body { margin: 0; font-family: ${editorState.pageSettings.googleFont ? `'${editorState.pageSettings.googleFont}', ` : ''}sans-serif; }\n`;
        // Basis-Styling für Spalten etc.
        html += `    .row-flex { display: flex; gap: 10px; padding: 5px 0; flex-wrap: wrap; } /* flex-wrap für responsive */\n`;
        html += `    .col-flex { flex: 1; min-width: 280px; /* Basis für Umbruch */ }\n`; // min-width für responsive
        if (editorState.pageSettings.customCSS) {
            html += `    /* --- Benutzerdefiniertes CSS Start --- */\n`;
            html += `    ${editorState.pageSettings.customCSS}\n`;
            html += `    /* --- Benutzerdefiniertes CSS Ende --- */\n`;
        }
        html += `  </style>\n`;
        html += `</head>\n<body>\n`;

        // PHP Formular Handler einfügen, falls benötigt
        let hasForm = false;
        function checkForm(elements) {
            for (const el of elements) {
                if (el.definitionId === 'form_container') return true;
                if (el.children && checkForm(el.children)) return true;
            }
            return false;
        }
        if (forPhpExport && checkForm(editorState.canvasElements)) {
            hasForm = true;
            html += "<?php\n";
            html += "// Einfacher PHP Formular Handler (Beispiel - NICHT PRODUKTIV NUTZEN OHNE SICHERHEITSCHECKS!)\n";
            html += "if ($_SERVER['REQUEST_METHOD'] == 'POST') {\n";
            html += "    $to = 'deine-email@example.com'; // BITTE ERSETZEN!\n";
            html += "    $subject = 'Neue Formularnachricht';\n";
            html += "    $message_body = '';\n";
            html += "    foreach ($_POST as \$key => \$value) {\n";
            html += "        $message_body .= htmlspecialchars(\$key) . ': ' . htmlspecialchars(\$value) . \"\\n\";\n";
            html += "    }\n";
            html += "    $headers = 'From: webform@example.com'; // BITTE ANPASSEN\n";
            html += "    if (mail($to, $subject, $message_body, $headers)) {\n";
            html += "        echo '<p style=\"color:green; text-align:center; padding:10px; background:#e6ffe6;\">Nachricht erfolgreich gesendet!</p>';\n";
            html += "    } else {\n";
            html += "        echo '<p style=\"color:red; text-align:center; padding:10px; background:#ffe6e6;\">Fehler beim Senden der Nachricht.</p>';\n";
            html += "    }\n";
            html += "}\n";
            html += "?>\n";
        }


        function buildHtmlRecursive(elements) {
            let elementsHtml = "";
            elements.forEach(elementData => {
                const definition = WEB_ELEMENTS.find(def => def.id === elementData.definitionId);
                if (!definition) return;

                let openingTag = `<${definition.htmlTag}`;
                // Attribute
                for (const attr in elementData.properties) {
                    const val = elementData.properties[attr];
                    if (val !== undefined && val !== null && val !== '') {
                         if (attr === 'required' && typeof val === 'boolean') {
                            if (val) openingTag += ` ${attr}`;
                        } else {
                            openingTag += ` ${attr}="${escapeHtml(String(val))}"`;
                        }
                    }
                }
                // Styles (Inline - nicht ideal, aber für "leichte" Version OK)
                let styleString = '';
                for (const styleProp in elementData.styles) {
                    if (elementData.styles[styleProp]) {
                        styleString += `${styleProp.replace(/([A-Z])/g, '-$1').toLowerCase()}:${escapeHtml(elementData.styles[styleProp])}; `;
                    }
                }
                if (styleString) {
                    openingTag += ` style="${styleString.trim()}"`;
                }
                openingTag += '>';
                elementsHtml += openingTag;

                // Inhalt oder Kinder
                if (definition.generateStructure) { // Für Spalten etc.
                    elementsHtml += definition.generateStructure(); // Fügt die leere Spaltenstruktur ein
                    // Kinder von Spalten müssen hier intelligent platziert werden.
                    // Diese Logik ist im aktuellen Datenmodell nicht einfach abzubilden.
                    // Die Kinder sind auf Root-Ebene oder in anderen Containern, nicht direkt in der Spalten-Definition.
                    // Für den Export müssen wir die Kinder, die für diese Spaltenreihe vorgesehen sind, finden.
                    // Dies ist ein sehr komplexer Teil, der hier vereinfacht wird, indem er Kinder direkt in die Row einfügt.
                    // Eine bessere Lösung würde die Spalten-Divs direkt im DOM suchen und die Kinder dort platzieren.
                    // ODER: Das Datenmodell muss Spalten als echte Container mit Kindern behandeln.
                    if (elementData.children && elementData.children.length > 0) {
                         // Hier müsste man die Kinder in die .col-flex divs der gerade erzeugten Struktur einfügen.
                         // Das ist mit reinem String-Concat schwierig ohne DOM-Manipulation.
                         // Vereinfachung: Wir lassen es für den Export mal weg, oder fügen sie in die Row.
                         // elementsHtml += buildHtmlRecursive(elementData.children); // Würde sie in die Row einfügen
                    }

                } else if (definition.canHaveChildren && elementData.children && elementData.children.length > 0) {
                    elementsHtml += buildHtmlRecursive(elementData.children);
                } else if (elementData.content) {
                    elementsHtml += escapeHtml(elementData.content);
                }

                elementsHtml += `</${definition.htmlTag}>\n`;
            });
            return elementsHtml;
        }
        html += buildHtmlRecursive(editorState.canvasElements);

        html += '</body>\n</html>';
        return html;
    }

    function exportFile(content, filename, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // ---- Theme Toggle ----
    function toggleTheme() {
        document.body.classList.toggle('theme-dark');
        document.body.classList.toggle('theme-light');
        themeToggleButton.textContent = document.body.classList.contains('theme-dark') ? '☀️' : '🌙';
        // Optional: Präferenz in localStorage speichern
        localStorage.setItem('editorTheme', document.body.classList.contains('theme-dark') ? 'dark' : 'light');
    }
    // Beim Laden Theme aus localStorage wiederherstellen
    const savedTheme = localStorage.getItem('editorTheme');
    if (savedTheme === 'dark') {
        toggleTheme(); // Umschalten auf Dark, wenn gespeichert
    }


    // ---- Hilfsfunktionen ----
    function cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function camelCaseToLabel(str) {
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    }

    // ---- Event Listener Setup ----
    function setupEventListeners() {
        searchInput.addEventListener('input', (e) => loadPaletteElements(e.target.value));
        exportHtmlButton.addEventListener('click', () => {
            const htmlContent = generatePageHTML(false);
            exportFile(htmlContent, 'meine-webseite.html', 'text/html');
        });
        exportPhpButton.addEventListener('click', () => {
            const phpContent = generatePageHTML(true);
            exportFile(phpContent, 'meine-webseite.php', 'application/x-php');
        });
        saveProjectButton.addEventListener('click', saveProject);
        loadProjectInput.addEventListener('change', loadProject);
        newProjectButton.addEventListener('click', () => newProject(false)); // false für Bestätigung
        previewTabButton.addEventListener('click', () => {
            const htmlContent = generatePageHTML(false);
            const blob = new Blob([htmlContent], {type : 'text/html'});
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            // URL.revokeObjectURL(url); // Nicht sofort, da Tab es noch braucht. Browser macht das später.
        });

        undoButton.addEventListener('click', undo);
        redoButton.addEventListener('click', redo);

        responsiveControls.addEventListener('click', (e) => {
            if (e.target.id === 'btn-view-desktop') setResponsiveView('desktop');
            else if (e.target.id === 'btn-view-tablet') setResponsiveView('tablet');
            else if (e.target.id === 'btn-view-mobile') setResponsiveView('mobile');
        });

        themeToggleButton.addEventListener('click', toggleTheme);
        pageSettingsButton.addEventListener('click', openPageSettingsModal);
        savePageSettingsButton.addEventListener('click', handleSavePageSettings);
        closeModalButtons.forEach(btn => btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        }));

        loadTemplateButton.addEventListener('click', loadSelectedTemplate);
        document.querySelector('#template-selection-modal .close-button').addEventListener('click', () => {
            // Wenn Template Modal ohne Auswahl geschlossen wird und keine Elemente da sind, leeres Projekt starten
            if(editorState.canvasElements.length === 0 && history.length <=1) { // <=1, da der "Vorlage geladen" State existieren könnte
                newProject(true);
            }
        });

        // Schließen des Modals bei Klick außerhalb des Inhalts
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
                 if(event.target.id === 'template-selection-modal' && editorState.canvasElements.length === 0 && history.length <=1) {
                    newProject(true);
                }
            }
        });
    }

    // ---- App starten ----
    init();
});