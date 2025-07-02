// Ensure jsPDF is loaded
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    const COLOR_PALETTE = {
        "Blue": "#007ACC",
        "Green": "#28A745",
        "Red": "#DC3545",
        "Yellow": "#FFC107",
        "Turquoise": "#17A2B8",
        "Purple": "#6F42C1",
        "Orange": "#FD7E14",
        "Light Grey": "#6C757D",
        "Black": "#212529",
        "White": "#F8F9FA",
    };
    const DEFAULT_GLOBAL_TEXT_COLOR_NAME = "Orange";
    const DEFAULT_MARKER_COLOR_NAME = "Blue";
    const DEFAULT_BRANCH_LINE_COLOR = COLOR_PALETTE["Light Grey"];

    // DOM Elements
    const timelineCanvas = document.getElementById('timelineCanvas');
    const addEventMainBtn = document.getElementById('addEventMainBtn');
    const saveTimelineBtn = document.getElementById('saveTimelineBtn');
    const loadTimelineInput = document.getElementById('loadTimelineInput');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    const eventDialog = document.getElementById('eventDialog');
    const eventForm = document.getElementById('eventForm');
    const dialogTitle = document.getElementById('dialogTitle');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeInput = document.getElementById('eventTime');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const markerColorSelect = document.getElementById('markerColor');
    const textColorSelect = document.getElementById('textColor');
    const submitEventBtn = document.getElementById('submitEventBtn');
    const cancelEventBtn = document.getElementById('cancelEventBtn');

    const contextMenu = document.getElementById('contextMenu');

    // App State
    let events = []; // Main events array
    let editingEvent = null; // Store event being edited
    let currentTargetEventList = events; // Where new events are added (main or a branch)
    let currentParentBranchIdForNewEvent = null;
    let selectedEventForContext = null;

    // Populate color selects
    Object.keys(COLOR_PALETTE).forEach(colorName => {
        markerColorSelect.options.add(new Option(colorName, colorName));
        textColorSelect.options.add(new Option(colorName, colorName));
    });

    class TimelineEvent {
        constructor(timestamp, description, markerColorName = DEFAULT_MARKER_COLOR_NAME, textColorName = DEFAULT_GLOBAL_TEXT_COLOR_NAME,
                    eventId = null, isCollapsed = false, parentBranchId = null) {
            this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
            this.description = description;
            this.markerColorName = markerColorName;
            this.textColorName = textColorName;
            this.id = eventId || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.isCollapsed = isCollapsed;
            this.main_branch_events = [];
            this.parentBranchId = parentBranchId;
            this.domElement = null; // To store reference to the rendered DOM element
        }

        get markerColorHex() { return COLOR_PALETTE[this.markerColorName] || COLOR_PALETTE[DEFAULT_MARKER_COLOR_NAME]; }
        get textColorHex() { return COLOR_PALETTE[this.textColorName] || COLOR_PALETTE[DEFAULT_GLOBAL_TEXT_COLOR_NAME]; }

        toDict() {
            return {
                timestamp: this.timestamp.toISOString(),
                description: this.description,
                markerColorName: this.markerColorName,
                textColorName: this.textColorName,
                id: this.id,
                isCollapsed: this.isCollapsed,
                main_branch_events: this.main_branch_events.map(event => event.toDict()),
                parentBranchId: this.parentBranchId
            };
        }

        static fromDict(data) {
            const event = new TimelineEvent(
                new Date(data.timestamp),
                data.description,
                data.markerColorName || DEFAULT_MARKER_COLOR_NAME,
                data.textColorName || DEFAULT_GLOBAL_TEXT_COLOR_NAME,
                data.id,
                data.isCollapsed || false,
                data.parentBranchId
            );
            event.main_branch_events = (data.main_branch_events || []).map(branchEventData => TimelineEvent.fromDict(branchEventData));
            return event;
        }
    }

    function formatDate(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    function formatTime(date) {
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${min}`;
    }
    
    function findEventByIdRecursive(eventId, list = events) {
        for (const event of list) {
            if (event.id === eventId) return event;
            const foundInBranch = findEventByIdRecursive(eventId, event.main_branch_events);
            if (foundInBranch) return foundInBranch;
        }
        return null;
    }

    function findListContainingEvent(eventId, currentList = events) {
        for (const event of currentList) {
            if (event.id === eventId) return currentList;
            const foundInBranch = findListContainingEvent(eventId, event.main_branch_events);
            if (foundInBranch) return foundInBranch;
        }
        return null;
    }
    
    function findEventByDomElement(element) {
        const eventContainer = element.closest('.timeline-event-container');
        if (!eventContainer || !eventContainer.dataset.eventId) return null;
        return findEventByIdRecursive(eventContainer.dataset.eventId);
    }

    // --- Drawing Logic ---
    function drawTimeline() {
        timelineCanvas.innerHTML = ''; // Clear previous content
        if (!events.length) {
            timelineCanvas.innerHTML = '<p style="text-align: center; padding-top: 20px;">No events yet. Add one to get started!</p>';
            timelineCanvas.style.minHeight = '100px';
            // Remove main line if no events
            const existingMainLine = timelineCanvas.querySelector('.main-timeline-line');
            if (existingMainLine) existingMainLine.remove();
            return;
        }

        const PADDING = 50;
        const MAIN_EVENT_SPACING_X = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--event-spacing-x-main'));
        const BRANCH_EVENT_SPACING_X = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--event-spacing-x-branch'));
        const MARKER_RADIUS = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--marker-radius'));
        const MAIN_LINE_Y_PERCENT = 50; // Percentage from top for main line

        let totalTimelineWidth = PADDING; // Start with left padding

        // Create main timeline line element if it doesn't exist
        let mainLineElement = timelineCanvas.querySelector('.main-timeline-line');
        if (!mainLineElement) {
            mainLineElement = document.createElement('div');
            mainLineElement.className = 'main-timeline-line';
            timelineCanvas.appendChild(mainLineElement);
        }
        // Position it based on canvas height at draw time
        const canvasHeight = timelineCanvas.clientHeight > 0 ? timelineCanvas.clientHeight : 500; // Ensure a fallback
        const mainLineYAbsolute = canvasHeight * (MAIN_LINE_Y_PERCENT / 100);
        mainLineElement.style.top = `${mainLineYAbsolute}px`;


        let currentX = PADDING;
        let minY = mainLineYAbsolute, maxY = mainLineYAbsolute;

        events.forEach((event, index) => {
            const eventPos = { x: currentX, y: mainLineYAbsolute };
            const isAbove = index % 2 === 0;
            const drawnDimensions = drawEventElement(event, eventPos, isAbove, 0, mainLineYAbsolute, MAIN_EVENT_SPACING_X);
            minY = Math.min(minY, drawnDimensions.top);
            maxY = Math.max(maxY, drawnDimensions.bottom);
            totalTimelineWidth = Math.max(totalTimelineWidth, drawnDimensions.right + PADDING);
            currentX += MAIN_EVENT_SPACING_X;
        });
        
        mainLineElement.style.width = `${Math.max(totalTimelineWidth - PADDING, PADDING)}px`; // Stretch line
        mainLineElement.style.left = `${PADDING/2}px`; // Center it a bit if only one element

        // Adjust canvas dimensions (minWidth for horizontal scroll, minHeight for vertical content)
        timelineCanvas.style.minWidth = `${totalTimelineWidth}px`;
        // Add padding to min/max Y for scroll region
        const contentHeight = maxY - minY;
        // Ensure canvas is tall enough for content, considering its own padding
        timelineCanvas.style.minHeight = `${contentHeight + 2 * PADDING}px`;

        // Re-center main line if content shifts Y significantly (e.g., many branches below)
        // This is a simplification; true dynamic centering is complex.
        // For now, we set mainLineYAbsolute based on initial canvas height.
        // If elements go far above/below, the user scrolls.
    }

    function drawEventElement(event, parentMarkerPos, isAboveParent, level, branchLineY, eventSpacingX) {
        const MARKER_RADIUS = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--marker-radius'));
        const EVENT_HEIGHT_OFFSET_MAIN = 60; // For main events from main line
        const VERTICAL_BRANCH_OFFSET_FROM_PARENT_MARKER = 70; // For first branch line from parent marker
        const VERTICAL_BRANCH_OFFSET_RECURSIVE = 50; // For subsequent nested branch lines

        const container = document.createElement('div');
        container.className = 'timeline-event-container';
        container.dataset.eventId = event.id;
        event.domElement = container; // Store reference

        const marker = document.createElement('div');
        marker.className = 'event-marker';
        marker.style.backgroundColor = event.markerColorHex;

        const details = document.createElement('div');
        details.className = 'event-details';
        details.style.color = event.textColorHex;

        const dateTimeSpan = document.createElement('span');
        dateTimeSpan.className = 'event-date-time';
        const collapseSymbol = event.isCollapsed ? '[+]' : '[-]';
        dateTimeSpan.textContent = `${formatDate(event.timestamp)} ${collapseSymbol}`;
        dateTimeSpan.onclick = () => toggleCollapseEvent(event); // Direct click for collapse

        details.appendChild(dateTimeSpan);

        if (!event.isCollapsed) {
            const timeSpan = document.createElement('div');
            timeSpan.textContent = formatTime(event.timestamp);
            timeSpan.style.fontSize = '0.9em';
            details.appendChild(timeSpan);

            const descSpan = document.createElement('div');
            descSpan.className = 'event-description';
            descSpan.textContent = event.description;
            details.appendChild(descSpan);
        }

        // Positioning Logic
        let currentX = parentMarkerPos.x;
        let markerY, textY, connectorEndY;
        let connectorStartY = parentMarkerPos.y; // Y of the line this event connects TO

        if (level === 0) { // Main event
            container.style.width = `${eventSpacingX}px`;
            connectorEndY = parentMarkerPos.y + (isAboveParent ? -EVENT_HEIGHT_OFFSET_MAIN : EVENT_HEIGHT_OFFSET_MAIN);
            markerY = connectorEndY;
            textY = markerY + (isAboveParent ? -(MARKER_RADIUS + 5) : (MARKER_RADIUS + 5)); // 5px padding
            if (isAboveParent) {
                container.appendChild(details);
                container.appendChild(marker);
                details.style.marginBottom = `${MARKER_RADIUS}px`;
            } else {
                container.appendChild(marker);
                container.appendChild(details);
                details.style.marginTop = `${MARKER_RADIUS}px`;
            }
             // Vertical connector line from main line to marker
            const connector = document.createElement('div');
            connector.className = 'event-connector';
            connector.style.height = `${EVENT_HEIGHT_OFFSET_MAIN - MARKER_RADIUS}px`;
            connector.style.left = `${currentX}px`;
            if (isAboveParent) {
                connector.style.top = `${markerY + MARKER_RADIUS}px`;
            } else {
                connector.style.top = `${parentMarkerPos.y}px`;
            }
            timelineCanvas.appendChild(connector);

        } else { // Branch event
            container.classList.add('branch-event');
            container.style.width = `${eventSpacingX}px`;
            markerY = branchLineY; // Marker is ON the branch line
            connectorStartY = markerY; // For branches, they connect to their own marker level
            
            // For branches, text is always above the marker for simplicity
            // And marker is directly on its branch line
            textY = markerY - (MARKER_RADIUS + 5);
            container.appendChild(details);
            container.appendChild(marker);
            details.style.marginBottom = `${MARKER_RADIUS}px`;

            // Short vertical connector from branch line to marker (if marker not directly on line)
            // For this simplified CSS version, marker is on the line, so connector is tiny or decorative
            const branchConnector = document.createElement('div');
            branchConnector.className = 'event-connector'; // Reuse style
            branchConnector.style.height = `${MARKER_RADIUS * 1.5}px`; // Small stem
            branchConnector.style.left = `${currentX}px`;
            branchConnector.style.top = `${markerY - MARKER_RADIUS * 1.5}px`;
            if (isAboveParent) { // if branch line is above parent marker
                 branchConnector.style.top = `${markerY - MARKER_RADIUS * 1.5}px`;
            } else { // if branch line is below parent marker
                 branchConnector.style.top = `${markerY - MARKER_RADIUS * 1.5}px`; // simplified: always above marker
            }
            timelineCanvas.appendChild(branchConnector);
        }
        
        container.style.left = `${currentX - eventSpacingX / 2}px`;
        // Adjust Y based on whether text is above or below marker and its own height
        const approxTextHeight = details.offsetHeight || (event.isCollapsed ? 20 : 60);
        if ((level === 0 && isAboveParent) || (level > 0) ) { // Text above marker
             container.style.top = `${textY - approxTextHeight}px`;
        } else { // Text below marker (only for main events below line)
             container.style.top = `${markerY - MARKER_RADIUS}px`; // Align top of marker
        }
        timelineCanvas.appendChild(container);

        // Calculate actual bounding box for scroll region adjustment
        // For simplicity, using offsets of marker for now
        const eventTop = parseFloat(container.style.top);
        const eventBottom = eventTop + container.offsetHeight;
        const eventLeft = parseFloat(container.style.left);
        const eventRight = eventLeft + parseFloat(container.style.width);


        // Draw branches recursively
        let maxBranchRight = currentX;
        if (event.main_branch_events.length > 0 && !event.isCollapsed) {
            let childBranchLineY;
            let verticalConnectorToBranchLineStartY = markerY; // From current event's marker
            
            if (level === 0) { // First level branch
                childBranchLineY = markerY + (isAboveParent ? -VERTICAL_BRANCH_OFFSET_FROM_PARENT_MARKER : VERTICAL_BRANCH_OFFSET_FROM_PARENT_MARKER);
            } else { // Nested branch
                childBranchLineY = markerY + (isAboveParent ? -VERTICAL_BRANCH_OFFSET_RECURSIVE : VERTICAL_BRANCH_OFFSET_RECURSIVE);
            }

            // Vertical line from parent marker to start of horizontal branch line
            const verticalBranchStartConnector = document.createElement('div');
            verticalBranchStartConnector.className = 'branch-line-vertical';
            verticalBranchStartConnector.style.left = `${currentX}px`;
            const vBranchLineHeight = Math.abs(childBranchLineY - verticalConnectorToBranchLineStartY);
            verticalBranchStartConnector.style.height = `${vBranchLineHeight}px`;
            if (childBranchLineY > verticalConnectorToBranchLineStartY) {
                verticalBranchStartConnector.style.top = `${verticalConnectorToBranchLineStartY}px`;
            } else {
                verticalBranchStartConnector.style.top = `${childBranchLineY}px`;
            }
            timelineCanvas.appendChild(verticalBranchStartConnector);
            
            let branchCurrentX = currentX; // Branches start horizontally aligned with parent
            const numBranchEvents = event.main_branch_events.length;
            const totalBranchWidth = (numBranchEvents > 0 ? (numBranchEvents -1) : 0) * BRANCH_EVENT_SPACING_X;
            
            // Horizontal line for the branch
            if (numBranchEvents > 0) {
                const horizontalBranchLine = document.createElement('div');
                horizontalBranchLine.className = 'branch-line-horizontal';
                horizontalBranchLine.style.top = `${childBranchLineY}px`;
                horizontalBranchLine.style.left = `${branchCurrentX}px`;
                horizontalBranchLine.style.width = `${totalBranchWidth}px`;
                timelineCanvas.appendChild(horizontalBranchLine);
            }

            event.main_branch_events.forEach((branchEvent, branchIndex) => {
                const branchEventPos = { x: branchCurrentX + (branchIndex * BRANCH_EVENT_SPACING_X), y: childBranchLineY };
                // Alternate isAboveParent for visual separation of nested branches, relative to its own branch line
                const branchIsAboveItsLine = !isAboveParent; // Simplified: just alternate from parent
                const branchDimensions = drawEventElement(branchEvent, branchEventPos, branchIsAboveItsLine, level + 1, childBranchLineY, BRANCH_EVENT_SPACING_X);
                maxBranchRight = Math.max(maxBranchRight, branchDimensions.right);
            });
        }
        
        // Return dimensions for parent to calculate overall timeline size
        // This needs to be more accurate, considering children
        return { 
            top: eventTop, 
            bottom: eventBottom, 
            left: eventLeft, 
            right: Math.max(eventRight, maxBranchRight)
        };
    }

    // --- Event Handlers ---
    addEventMainBtn.addEventListener('click', () => {
        editingEvent = null;
        currentTargetEventList = events;
        currentParentBranchIdForNewEvent = null;
        dialogTitle.textContent = 'Add Main Event';
        submitEventBtn.textContent = 'Add';
        eventForm.reset();
        markerColorSelect.value = DEFAULT_MARKER_COLOR_NAME;
        textColorSelect.value = DEFAULT_GLOBAL_TEXT_COLOR_NAME;
        // Set default date and time
        const now = new Date();
        eventDateInput.valueAsDate = now;
        eventTimeInput.value = formatTime(now);
        eventDialog.showModal();
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const timestamp = new Date(`${eventDateInput.value}T${eventTimeInput.value}`);
        const description = eventDescriptionInput.value.trim();
        const markerColorName = markerColorSelect.value;
        const textColorName = textColorSelect.value;

        if (!description) {
            alert("Description cannot be empty.");
            return;
        }

        if (editingEvent) {
            editingEvent.timestamp = timestamp;
            editingEvent.description = description;
            editingEvent.markerColorName = markerColorName;
            editingEvent.textColorName = textColorName;
            // Find the list containing the event to re-sort it
            const list = findListContainingEvent(editingEvent.id);
            if (list) list.sort((a, b) => a.timestamp - b.timestamp);
        } else {
            const newEvent = new TimelineEvent(timestamp, description, markerColorName, textColorName, null, false, currentParentBranchIdForNewEvent);
            currentTargetEventList.push(newEvent);
            currentTargetEventList.sort((a, b) => a.timestamp - b.timestamp);
        }
        drawTimeline();
        eventDialog.close();
    });

    cancelEventBtn.addEventListener('click', () => {
        eventDialog.close();
    });

    function toggleCollapseEvent(event) {
        if (!event) return;
        event.isCollapsed = !event.isCollapsed;
        drawTimeline();
    }

    // --- Context Menu Logic ---
    timelineCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectedEventForContext = findEventByDomElement(e.target);

        if (selectedEventForContext) {
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.display = 'block';

            // Enable/disable "Delete Branch"
            const deleteBranchItem = contextMenu.querySelector('[data-action="deleteBranch"]');
            if (selectedEventForContext.main_branch_events.length > 0) {
                deleteBranchItem.classList.remove('disabled');
            } else {
                deleteBranchItem.classList.add('disabled');
            }
        } else {
            contextMenu.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => { // Close context menu on outside click
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
            selectedEventForContext = null;
        }
    });

    contextMenu.addEventListener('click', (e) => {
        if (!selectedEventForContext) return;
        const action = e.target.dataset.action;

        switch (action) {
            case 'edit':
                editingEvent = selectedEventForContext;
                dialogTitle.textContent = 'Edit Event';
                submitEventBtn.textContent = 'Save Changes';
                eventDateInput.valueAsDate = editingEvent.timestamp;
                eventTimeInput.value = formatTime(editingEvent.timestamp);
                eventDescriptionInput.value = editingEvent.description;
                markerColorSelect.value = editingEvent.markerColorName;
                textColorSelect.value = editingEvent.textColorName;
                // Set target list correctly for editing (though not strictly needed for edit itself)
                currentTargetEventList = findListContainingEvent(editingEvent.id) || events;
                currentParentBranchIdForNewEvent = editingEvent.parentBranchId;
                eventDialog.showModal();
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete event "${selectedEventForContext.description}"?`)) {
                    const list = findListContainingEvent(selectedEventForContext.id);
                    if (list) {
                        const index = list.findIndex(ev => ev.id === selectedEventForContext.id);
                        if (index > -1) list.splice(index, 1);
                        drawTimeline();
                    }
                }
                break;
            case 'toggleCollapse':
                toggleCollapseEvent(selectedEventForContext);
                break;
            case 'addBranchEvent':
                editingEvent = null; // Ensure we are adding new
                currentTargetEventList = selectedEventForContext.main_branch_events;
                currentParentBranchIdForNewEvent = selectedEventForContext.id;
                dialogTitle.textContent = `Add Event to Branch of "${selectedEventForContext.description}"`;
                submitEventBtn.textContent = 'Add';
                eventForm.reset();
                markerColorSelect.value = DEFAULT_MARKER_COLOR_NAME;
                textColorSelect.value = DEFAULT_GLOBAL_TEXT_COLOR_NAME;
                const now = new Date();
                eventDateInput.valueAsDate = now;
                eventTimeInput.value = formatTime(now);
                eventDialog.showModal();
                break;
            case 'deleteBranch':
                if (selectedEventForContext.main_branch_events.length > 0) {
                    if (confirm(`Delete entire branch from "${selectedEventForContext.description}" (including all its events)?`)) {
                        selectedEventForContext.main_branch_events = [];
                        drawTimeline();
                    }
                }
                break;
        }
        contextMenu.style.display = 'none'; // Close after action
        if (action !== 'edit') selectedEventForContext = null; // Clear selection unless editing
    });

    // --- Save/Load Logic ---
    saveTimelineBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(events.map(e => e.toDict()), null, 4);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timeline_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Timeline saved!');
    });

    loadTimelineInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target.result);
                events = loadedData.map(data => TimelineEvent.fromDict(data));
                events.sort((a,b) => a.timestamp - b.timestamp); // Sort main events
                drawTimeline();
                alert('Timeline loaded successfully!');
            } catch (err) {
                alert(`Error loading timeline: ${err.message}`);
                console.error("Load error:", err);
            }
        };
        reader.readAsText(file);
        loadTimelineInput.value = ''; // Reset file input
    });

    // --- PDF Export Logic (Simplified) ---
    function _drawPdfEventRecursive(pdf, event, xPos, baseY, level, isAboveParent, pageHeight, config) {
        const {
            markerRadiusPdf, eventSpacingXBranchPdf, verticalBranchOffsetPdf,
            branchLineColorRL, defaultTextColorRL
        } = config;
    
        let eventYLine = baseY;
        let markerYOnBranchLine = eventYLine;
    
        // Event Marker
        pdf.setFillColor(event.markerColorHex); // jsPDF uses current fill color
        pdf.setDrawColor(defaultTextColorRL); // Outline
        pdf.circle(xPos, markerYOnBranchLine, markerRadiusPdf, 'FD'); // Fill and Draw
    
        // Text
        pdf.setFontSize(level === 0 ? 8 : 7);
        pdf.setTextColor(event.textColorHex);
    
        const pdfLines = [];
        pdfLines.push(`${formatDate(event.timestamp)} ${formatTime(event.timestamp)}`);
        if (!event.isCollapsed) {
            const desc = event.description;
            const maxChars = level === 0 ? 25 : 20;
            for (let k = 0; k < desc.length; k += maxChars) {
                pdfLines.push(desc.substring(k, k + maxChars));
            }
        }
    
        const lineHeightPt = (level === 0 ? 8 : 7) * 0.35; // approx mm per line
        let textYPdf;
        
        if (level === 0) { // Main event text positioning
            textYPdf = markerYOnBranchLine + (isAboveParent ? -(markerRadiusPdf + 2) : (markerRadiusPdf + 2 + lineHeightPt)); // 2mm padding
            if(isAboveParent) { // Text above, draw upwards
                 pdfLines.reverse().forEach((line, i) => {
                    pdf.text(line, xPos, textYPdf - (i * lineHeightPt), { align: 'center' });
                });
                pdfLines.reverse(); // restore order
            } else { // Text below, draw downwards
                pdfLines.forEach((line, i) => {
                    pdf.text(line, xPos, textYPdf + (i * lineHeightPt), { align: 'center' });
                });
            }
        } else { // Branch event text (always above for simplicity)
            textYPdf = markerYOnBranchLine - (markerRadiusPdf + 2); // 2mm padding
            pdfLines.reverse().forEach((line, i) => { // Draw text upwards from textYPdf
                pdf.text(line, xPos, textYPdf - (i * lineHeightPt), { align: 'center' });
            });
            pdfLines.reverse(); // restore order
        }
    
        // Recursive for Branches
        if (event.main_branch_events.length > 0 && !event.isCollapsed) {
            const branchLineYPdf = markerYOnBranchLine + (isAboveParent && level > 0 ? -verticalBranchOffsetPdf : verticalBranchOffsetPdf); // Simplified: always offset same direction for nested
            
            pdf.setDrawColor(branchLineColorRL);
            pdf.setLineWidth(0.2); // Thinner line for PDF
            pdf.line(xPos, markerYOnBranchLine, xPos, branchLineYPdf); // Vertical connection
    
            const branchStartXPdf = xPos;
            if (event.main_branch_events.length > 0) {
                const branchLineEndXPdf = branchStartXPdf + (event.main_branch_events.length - 1) * eventSpacingXBranchPdf;
                pdf.line(branchStartXPdf, branchLineYPdf, branchLineEndXPdf, branchLineYPdf); // Horizontal branch line
    
                event.main_branch_events.forEach((branchEventPdf, branchIdx) => {
                    const branchEventXPdf = branchStartXPdf + branchIdx * eventSpacingXBranchPdf;
                    _drawPdfEventRecursive(pdf, branchEventPdf, branchEventXPdf, branchLineYPdf, level + 1, !isAboveParent, pageHeight, config);
                });
            }
        }
    }

    exportPdfBtn.addEventListener('click', () => {
        if (!events.length) {
            alert("No events to export.");
            return;
        }
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
        pdf.setTitle("My Life Timeline");

        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();

        // PDF Config (in mm)
        const pdfConfig = {
            paddingPdf: 15,
            mainLineYPdf: pageHeight / 2,
            eventSpacingXMainPdf: 40,
            eventSpacingXBranchPdf: 30,
            eventHeightOffsetMainPdf: 20,
            verticalBranchOffsetPdf: 25,
            markerRadiusPdf: 2,
            lineThicknessMainPdf: 0.5,
            defaultTextColorRL: COLOR_PALETTE[DEFAULT_GLOBAL_TEXT_COLOR_NAME],
            branchLineColorRL: DEFAULT_BRANCH_LINE_COLOR
        };

        pdf.setFillColor(46, 46, 46); // dark-bg as RGB
        pdf.rect(0, 0, pageWidth, pageHeight, 'F'); // Background

        let currentXPdf = pdfConfig.paddingPdf;
        const mainLineEndX = pdfConfig.paddingPdf + (events.length - 1) * pdfConfig.eventSpacingXMainPdf;
        pdf.setDrawColor(pdfConfig.defaultTextColorRL);
        pdf.setLineWidth(pdfConfig.lineThicknessMainPdf);
        pdf.line(pdfConfig.paddingPdf, pdfConfig.mainLineYPdf, mainLineEndX, pdfConfig.mainLineYPdf); // Main line

        events.forEach((event, i) => {
            const xPosPdf = currentXPdf;
            const isAbove = (i % 2 === 0);
            const connectionLineEndYPdf = pdfConfig.mainLineYPdf +
                (isAbove ? -pdfConfig.eventHeightOffsetMainPdf : pdfConfig.eventHeightOffsetMainPdf);

            pdf.setDrawColor(COLOR_PALETTE["Light Grey"]);
            pdf.setLineWidth(0.3);
            pdf.line(xPosPdf, pdfConfig.mainLineYPdf, xPosPdf, connectionLineEndYPdf); // Connector

            // _drawPdfEventRecursive handles marker and text for main event as level 0
            _drawPdfEventRecursive(pdf, event, xPosPdf, connectionLineEndYPdf, 0, isAbove, pageHeight, pdfConfig);
            
            currentXPdf += pdfConfig.eventSpacingXMainPdf;
        });

        pdf.save("timeline.pdf");
        alert('PDF exported!');
    });


    // Initial Draw
    drawTimeline();
});