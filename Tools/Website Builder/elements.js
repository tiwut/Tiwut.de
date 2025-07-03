const WEB_ELEMENTS = [
    {
        id: 'section_basic',
        name: 'Section',
        category: 'Grundstruktur',
        icon: '▢',
        htmlTag: 'section',
        defaultStyles: { padding: '20px 0', minHeight: '100px', border: '1px dashed #ccc' },
        canHaveChildren: true,
        properties: [
            { name: 'id', type: 'text', label: 'HTML ID' },
            { name: 'className', type: 'text', label: 'CSS-Klassen' },
            { name: 'backgroundColor', type: 'color', label: 'Hintergrundfarbe' },
            { name: 'padding', type: 'text', label: 'Innenabstand (CSS)', placeholder: 'z.B. 20px oder 10px 0' },
        ]
    },
    {
        id: 'columns_2',
        name: '2 Spalten',
        category: 'Grundstruktur',
        icon: '||',
        htmlTag: 'div',
        className: 'row-flex',
        generateStructure: () => `<div class="col-flex" data-canvas-id="col-${Date.now()}1"></div><div class="col-flex" data-canvas-id="col-${Date.now()}2"></div>`,
        canHaveChildren: true,
        properties: [
            { name: 'id', type: 'text', label: 'HTML ID (Reihe)' },
            { name: 'className', type: 'text', label: 'CSS-Klassen (Reihe)' },
            { name: 'gap', type: 'text', label: 'Spaltenabstand (CSS)', placeholder: 'z.B. 10px' }
        ]
    },
    {
        id: 'h1_heading',
        name: 'Überschrift H1',
        category: 'Text',
        icon: 'H₁',
        htmlTag: 'h1',
        defaultContent: 'Große Überschrift',
        defaultStyles: { color: '#333333', textAlign: 'left' },
        canHaveChildren: false,
        properties: [
            { name: 'textContent', type: 'textarea', label: 'Text' },
            { name: 'color', type: 'color', label: 'Textfarbe' },
            { name: 'textAlign', type: 'select', label: 'Ausrichtung', options: ['left', 'center', 'right', 'justify'] },
            { name: 'fontSize', type: 'text', label: 'Schriftgröße', placeholder: 'z.B. 32px oder 2em' },
        ]
    },
    {
        id: 'p_paragraph',
        name: 'Absatz',
        category: 'Text',
        icon: '¶',
        htmlTag: 'p',
        defaultContent: 'Dies ist ein Beispielabsatz. Bearbeite diesen Text.',
        defaultStyles: { color: '#555555', lineHeight: '1.6' },
        canHaveChildren: false,
        properties: [
            { name: 'textContent', type: 'textarea', label: 'Text' },
            { name: 'color', type: 'color', label: 'Textfarbe' },
            { name: 'fontSize', type: 'text', label: 'Schriftgröße', placeholder: 'z.B. 16px' },
            { name: 'lineHeight', type: 'text', label: 'Zeilenhöhe', placeholder: 'z.B. 1.6 oder 24px' },
            { name: 'textAlign', type: 'select', label: 'Ausrichtung', options: ['left', 'center', 'right', 'justify'] },
        ]
    },
    {
        id: 'img_basic',
        name: 'Bild',
        category: 'Medien',
        icon: '🖼️',
        htmlTag: 'img',
        defaultStyles: { maxWidth: '100%', height: 'auto', display: 'block' },
        canHaveChildren: false,
        properties: [
            { name: 'src', type: 'url', label: 'Bild-URL oder Data-URL' },
            { name: 'alt', type: 'text', label: 'Alternativtext (alt)' },
            { name: 'width', type: 'text', label: 'Breite (CSS)', placeholder: 'z.B. 100px oder 50%' },
            { name: 'height', type: 'text', label: 'Höhe (CSS)', placeholder: 'z.B. auto oder 100px' },
            { name: 'objectFit', type: 'select', label: 'Bildanpassung', options: ['fill', 'contain', 'cover', 'none', 'scale-down']},
            { name: 'margin', type: 'text', label: 'Außenabstand', placeholder: 'z.B. 0 auto' }
        ]
    },
    {
        id: 'button_basic',
        name: 'Button',
        category: 'Interaktion',
        icon: '🔘',
        htmlTag: 'a',
        defaultContent: 'Klick Mich',
        defaultAttributes: { href: '#', role: 'button' },
        defaultStyles: {
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            textAlign: 'center'
        },
        canHaveChildren: false,
        properties: [
            { name: 'textContent', type: 'text', label: 'Button-Text' },
            { name: 'href', type: 'url', label: 'Link-URL (href)' },
            { name: 'backgroundColor', type: 'color', label: 'Hintergrundfarbe' },
            { name: 'color', type: 'color', label: 'Textfarbe' },
            { name: 'padding', type: 'text', label: 'Innenabstand', placeholder: 'z.B. 10px 20px' },
            { name: 'borderRadius', type: 'text', label: 'Eckenradius', placeholder: 'z.B. 4px' },
            { name: 'target', type: 'select', label: 'Link öffnen in', options: ['_self', '_blank'] }
        ]
    },
    {
        id: 'divider_basic',
        name: 'Trennlinie',
        category: 'Layout-Helfer',
        icon: '─',
        htmlTag: 'hr',
        defaultStyles: { margin: '20px 0', borderColor: '#dddddd' },
        canHaveChildren: false,
        properties: [
            { name: 'color', type: 'color', label: 'Farbe (borderColor)' },
            { name: 'margin', type: 'text', label: 'Außenabstand (CSS)', placeholder: 'z.B. 20px 0' },
            { name: 'height', type: 'text', label: 'Dicke (borderTopWidth)', placeholder: 'z.B. 1px'}
        ]
    },
    {
        id: 'spacer_basic',
        name: 'Abstandshalter',
        category: 'Layout-Helfer',
        icon: '↕️',
        htmlTag: 'div',
        defaultStyles: { height: '20px' },
        canHaveChildren: false,
        properties: [
            { name: 'height', type: 'text', label: 'Höhe (CSS)', placeholder: 'z.B. 20px' }
        ]
    },
    {
        id: 'form_container',
        name: 'Formular Container',
        category: 'Formulare',
        icon: '📝',
        htmlTag: 'form',
        defaultAttributes: { action: '', method: 'POST' },
        defaultStyles: { padding: '15px', border: '1px solid #eee' },
        canHaveChildren: true,
        properties: [
            { name: 'action', type: 'text', label: 'Action URL' },
            { name: 'method', type: 'select', label: 'Methode', options: ['POST', 'GET'] },
            { name: 'id', type: 'text', label: 'HTML ID' },
            { name: 'className', type: 'text', label: 'CSS-Klassen' },
        ]
    },
    {
        id: 'input_text',
        name: 'Texteingabefeld',
        category: 'Formulare',
        icon: '⌨️',
        htmlTag: 'input',
        defaultAttributes: { type: 'text', placeholder: 'Text eingeben', name: 'text_input' },
        defaultStyles: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: 'calc(100% - 18px)', marginBottom: '10px' },
        canHaveChildren: false,
        properties: [
            { name: 'type', type: 'select', label: 'Typ', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
            { name: 'placeholder', type: 'text', label: 'Platzhalter' },
            { name: 'name', type: 'text', label: 'Feldname (für PHP)' },
            { name: 'id', type: 'text', label: 'HTML ID' },
            { name: 'required', type: 'checkbox', label: 'Pflichtfeld' }
        ]
    },
    {
        id: 'textarea_basic',
        name: 'Textbereich',
        category: 'Formulare',
        icon: '≣',
        htmlTag: 'textarea',
        defaultAttributes: { placeholder: 'Nachricht hier...', name: 'message_area', rows: '4' },
        defaultStyles: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: 'calc(100% - 18px)', marginBottom: '10px' },
        canHaveChildren: false,
        properties: [
            { name: 'placeholder', type: 'text', label: 'Platzhalter' },
            { name: 'name', type: 'text', label: 'Feldname (für PHP)' },
            { name: 'id', type: 'text', label: 'HTML ID' },
            { name: 'rows', type: 'number', label: 'Zeilen (rows)' },
            { name: 'required', type: 'checkbox', label: 'Pflichtfeld' }
        ]
    },
    {
        id: 'button_submit',
        name: 'Sende-Button',
        category: 'Formulare',
        icon: '➡️',
        htmlTag: 'button',
        defaultContent: 'Senden',
        defaultAttributes: { type: 'submit' },
        defaultStyles: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        canHaveChildren: false,
        properties: [
            { name: 'textContent', type: 'text', label: 'Button-Text' },
            { name: 'type', type: 'select', label: 'Button-Typ', options: ['submit', 'button', 'reset'] }
        ]
    },
    {
        id: 'hero_simple',
        name: 'Einfacher Hero',
        category: 'Vorgefertigte Blöcke',
        icon: '🌟',
        isBlock: true,
        structure: [
            {
                definitionId: 'section_basic',
                properties: { backgroundColor: '#f0f0f0', padding: '50px 20px' },
                children: [
                    {
                        definitionId: 'h1_heading',
                        properties: { textContent: 'Willkommen auf unserer Seite!', textAlign: 'center', fontSize: '40px' }
                    },
                    {
                        definitionId: 'p_paragraph',
                        properties: { textContent: 'Entdecke hier erstaunliche Dinge. Dieser Block ist ein Beispiel für eine vorgefertigte Sektion.', textAlign: 'center', fontSize: '18px', color: '#666' }
                    },
                    {
                        definitionId: 'button_basic',
                        properties: { textContent: 'Mehr Erfahren', href:'#next-section', margin: '20px auto 0 auto', display: 'block', width: 'fit-content' }
                    }
                ]
            }
        ]
    },
];

const TEMPLATES = {
    blank: {
        pageSettings: { pageTitle: "Neues Projekt", metaDescription: "", googleFont: "", customCSS: "" },
        canvasElements: []
    },
    landing_page_simple: {
        pageSettings: {
            pageTitle: "Meine Landing Page",
            metaDescription: "Eine einfache Landing Page, erstellt mit dem Leichten Web Builder.",
            googleFont: "Roboto",
            customCSS: "body { font-family: 'Roboto', sans-serif; }"
        },
        canvasElements: [
            {
                definitionId: 'section_basic',
                id: `canvas-el-${Date.now() + 1}`,
                properties: { id: 'hero', backgroundColor: '#e9ecef', padding: '60px 20px' },
                styles: { backgroundColor: '#e9ecef', padding: '60px 20px' },
                children: [
                    {
                        definitionId: 'h1_heading',
                        id: `canvas-el-${Date.now() + 2}`,
                        properties: { textContent: 'Revolutionäres Produkt X', className: '', id: '' },
                        styles: { color: '#333333', textAlign: 'center', fontSize: '48px' },
                    },
                    {
                        definitionId: 'p_paragraph',
                        id: `canvas-el-${Date.now() + 3}`,
                        properties: { textContent: 'Die Lösung für all Ihre Probleme. Einfach, schnell und effizient. Überzeugen Sie sich selbst von den Vorteilen.' },
                        styles: { color: '#555555', lineHeight: '1.6', textAlign: 'center', fontSize: '20px', maxWidth: '700px', margin: '15px auto' },
                    },
                    {
                        definitionId: 'button_basic',
                        id: `canvas-el-${Date.now() + 4}`,
                        properties: { textContent: 'Jetzt Entdecken', href: '#features' },
                        styles: { display: 'block', padding: '12px 25px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center', margin: '20px auto 0 auto', width: 'fit-content' },
                    }
                ]
            },
        ]
    },
    portfolio_basic: {
        pageSettings: { pageTitle: "Mein Portfolio", metaDescription: "Portfolio Seite.", googleFont: "Lato", customCSS: "" },
        canvasElements: []
    }
};