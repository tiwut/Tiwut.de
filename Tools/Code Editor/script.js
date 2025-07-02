// script.js - Kompletter und zusammengeführter Code mit Skript-Presets
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let editor; let currentTranslations = {}; let activeView = 'files';
    const fileState = { dirHandle: null, fileHandles: new Map(), activeFile: null };
    const searchState = { findController: null };
    const supportedLangs = ['en', 'de', 'es']; const defaultLang = 'en';

    const fileContentPresets = {
        'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Title</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <script src="script.js"><\/script>\n</body>\n</html>`,
        'style.css': `body {\n    font-family: sans-serif;\n    line-height: 1.6;\n}`,
        'script.js': `console.log("Hello, World!");`,
        'main.py': `def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`,
        'app.ts': `const message: string = "Hello, TypeScript!";\nconsole.log(message);`,
        'script.sh': `#!/bin/bash\n\necho "Hello from your shell script!"`,
        'README.md': `# My New Project\n\nThis is the README file for the project.`,
        'data.json': `{\n    "key": "value",\n    "version": 1.0\n}`
    };

    // --- UI ELEMENTS ---
    const ui = {
        activityBarIcons: document.querySelectorAll('.activity-bar .icon'),
        viewPanels: document.querySelectorAll('.view-panel'),
        i18n: { text: document.querySelectorAll('[data-i18n-key]'), title: document.querySelectorAll('[data-i18n-key-title]'), placeholder: document.querySelectorAll('[data-i18n-key-placeholder]') },
        explorer: { list: document.querySelector('.file-explorer-list'), openBtn: document.getElementById('open-folder-btn'), newBtn: document.getElementById('new-file-btn') },
        statusBar: { saveBtn: document.getElementById('save-file-btn'), exportBtn: document.getElementById('export-zip-btn'), langSelect: document.getElementById('language-selector'), themeSelect: document.getElementById('theme-selector') },
        search: { input: document.getElementById('search-input'), replace: document.getElementById('replace-input'), replaceBtn: document.getElementById('replace-btn'), replaceAllBtn: document.getElementById('replace-all-btn') },
        settings: { langSelect: document.getElementById('settings-language-selector'), themeSelect: document.getElementById('settings-theme-selector'), fontsizeInput: document.getElementById('settings-fontsize-input') },
        newFileModal: {
            overlay: document.getElementById('new-file-modal'), filename: document.getElementById('new-filename-input'), preset: document.getElementById('new-file-preset-select'),
            customGroup: document.getElementById('custom-extension-group'), customExt: document.getElementById('new-file-custom-ext'),
            createBtn: document.getElementById('create-file-btn'), cancelBtn: document.getElementById('cancel-new-file-btn'), error: document.getElementById('new-file-error')
        }
    };

    // --- MONACO EDITOR & APP INITIALIZATION ---
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' }});
    require(['vs/editor/editor.main'], () => { initializeEditor(); initializeApp(); });

    function initializeEditor(content = '', language = 'plaintext') {
        if (editor) { editor.setValue(content); monaco.editor.setModelLanguage(editor.getModel(), language); return; }
        editor = monaco.editor.create(document.getElementById('editor-container'), { value: content, language: language, theme: 'vs-dark', automaticLayout: true, fontSize: 14, minimap: { enabled: true } });
    }

    function initializeApp() {
        const savedTheme = localStorage.getItem('editorTheme') || 'dark';
        const savedFontSize = localStorage.getItem('editorFontSize') || '14';
        const initialLang = getBrowserLanguage();

        ui.explorer.newBtn.disabled = true;
        ui.settings.fontsizeInput.value = savedFontSize;
        setFontSize(savedFontSize);
        
        populateSelect(ui.statusBar.themeSelect, ['dark', 'light', 'contrast'], 'theme'); populateSelect(ui.settings.themeSelect, ['dark', 'light', 'contrast'], 'theme');
        populateSelect(ui.statusBar.langSelect, supportedLangs); populateSelect(ui.settings.langSelect, supportedLangs);
        const presetOptions = ['index.html', 'style.css', 'script.js', 'main.py', 'app.ts', 'script.sh', 'README.md', 'data.json', 'custom'];
        populateSelect(ui.newFileModal.preset, presetOptions, 'preset');
        
        setTheme(savedTheme);
        loadLanguage(initialLang);
        setupEventListeners();
    }
    
    // --- EVENT LISTENER SETUP ---
    function setupEventListeners() {
        ui.activityBarIcons.forEach(icon => icon.addEventListener('click', () => setActiveView(icon.dataset.viewId)));
        if ('showDirectoryPicker' in window) { ui.explorer.openBtn.addEventListener('click', handleOpenFolder); } else { ui.explorer.openBtn.style.display = 'none'; }
        ui.explorer.list.addEventListener('click', e => { const li = e.target.closest('li'); if (li && li.dataset.filename) openFileInEditor(li.dataset.filename); });
        ui.statusBar.saveBtn.addEventListener('click', saveActiveFile); ui.statusBar.exportBtn.addEventListener('click', exportProjectAsZip);
        [ui.statusBar.themeSelect, ui.settings.themeSelect].forEach(s => s.addEventListener('change', e => setTheme(e.target.value)));
        [ui.statusBar.langSelect, ui.settings.langSelect].forEach(s => s.addEventListener('change', e => loadLanguage(e.target.value)));
        ui.settings.fontsizeInput.addEventListener('input', e => setFontSize(e.target.value));
        ui.search.input.addEventListener('input', performSearch); ui.search.replace.addEventListener('keydown', e => { if(e.key === 'Enter') performReplace(); });
        ui.search.replaceBtn.addEventListener('click', performReplace); ui.search.replaceAllBtn.addEventListener('click', performReplaceAll);
        ui.explorer.newBtn.addEventListener('click', openNewFileDialog);
        ui.newFileModal.overlay.addEventListener('click', (e) => { if(e.target === ui.newFileModal.overlay) closeNewFileDialog(); });
        ui.newFileModal.cancelBtn.addEventListener('click', closeNewFileDialog); ui.newFileModal.createBtn.addEventListener('click', handleCreateFile);
        ui.newFileModal.preset.addEventListener('change', () => ui.newFileModal.customGroup.classList.toggle('hidden', ui.newFileModal.preset.value !== 'custom'));
    }
    
    // --- VIEW, MODAL, SETTINGS & SEARCH LOGIC ---
    function setActiveView(viewId) {
        activeView = viewId;
        ui.activityBarIcons.forEach(icon => icon.classList.toggle('active', icon.dataset.viewId === viewId));
        ui.viewPanels.forEach(panel => panel.classList.toggle('hidden', panel.id !== `view-${viewId}`));
        if (viewId === 'search' && editor) { ui.search.input.focus(); searchState.findController = editor.getContribution('editor.contrib.findController'); }
    }
    function openNewFileDialog() {
        if (!fileState.dirHandle) { showNotification(currentTranslations['error.openFolderFirst']); return; }
        ui.newFileModal.overlay.classList.remove('hidden'); ui.newFileModal.filename.value = ''; ui.newFileModal.customExt.value = '';
        ui.newFileModal.preset.value = 'index.html'; ui.newFileModal.customGroup.classList.add('hidden'); ui.newFileModal.error.textContent = ''; ui.newFileModal.filename.focus();
    }
    function closeNewFileDialog() { ui.newFileModal.overlay.classList.add('hidden'); }
    function setTheme(theme) {
        document.body.className = `theme-${theme}`; if (editor) monaco.editor.setTheme(theme === 'light' ? 'vs' : (theme === 'contrast' ? 'hc-black' : 'vs-dark'));
        localStorage.setItem('editorTheme', theme); ui.statusBar.themeSelect.value = theme; ui.settings.themeSelect.value = theme;
    }
    function setFontSize(size) {
        const newSize = parseInt(size, 10); if (editor) editor.updateOptions({ fontSize: newSize });
        localStorage.setItem('editorFontSize', newSize); ui.settings.fontsizeInput.value = newSize;
    }
    function performSearch() { if (!editor || !searchState.findController) return; searchState.findController.setSearchString(ui.search.input.value); searchState.findController.start({ forceRevealReplace: true, shouldFocus: 0, shouldSelect: 3 }); }
    function performReplace() { if (searchState.findController) searchState.findController.replace(); }
    function performReplaceAll() { if (searchState.findController) searchState.findController.replaceAll(); }

    // --- FILE SYSTEM LOGIC ---
    async function handleOpenFolder() {
        try {
            fileState.dirHandle = await window.showDirectoryPicker(); fileState.fileHandles.clear();
            for await (const entry of fileState.dirHandle.values()) if (entry.kind === 'file') fileState.fileHandles.set(entry.name, entry);
            renderFileExplorer();
            if (!fileState.activeFile && fileState.fileHandles.size > 0) openFileInEditor([...fileState.fileHandles.keys()].sort()[0]);
        } catch (error) { console.error('Error opening folder:', error); }
    }
    function renderFileExplorer() {
        ui.explorer.list.innerHTML = '';
        ui.explorer.newBtn.disabled = !fileState.dirHandle;
        if (fileState.fileHandles.size === 0) return;
        for (const name of [...fileState.fileHandles.keys()].sort()) {
            const li = document.createElement('li'); li.dataset.filename = name; li.innerHTML = `<i class="${getIconForFile(name)}"></i> ${name}`;
            if (name === fileState.activeFile) li.classList.add('active');
            ui.explorer.list.appendChild(li);
        }
    }
    async function openFileInEditor(fileName) {
        if (!fileState.fileHandles.has(fileName)) return;
        const handle = fileState.fileHandles.get(fileName);
        const content = handle.isNew ? handle.content : await (await handle.getFile()).text();
        fileState.activeFile = fileName;
        initializeEditor(content, getLanguageForFile(fileName)); renderFileExplorer();
    }
    async function saveActiveFile() {
        if (!fileState.activeFile) { showNotification(currentTranslations.noFileOpen); return; }
        const handle = fileState.fileHandles.get(fileState.activeFile); const content = editor.getValue();
        if (handle.isNew) {
            try {
                const newHandle = await window.showSaveFilePicker({ suggestedName: handle.name, types: [{ description: 'All Files', accept: {'text/plain': ['.*']} }] });
                fileState.fileHandles.delete(handle.name); fileState.fileHandles.set(newHandle.name, newHandle); fileState.activeFile = newHandle.name;
                const writable = await newHandle.createWritable(); await writable.write(content); await writable.close();
                renderFileExplorer(); showNotification(currentTranslations.fileSaved);
            } catch (error) { console.log('Save As dialog cancelled.', error); }
        } else {
            try { const writable = await handle.createWritable(); await writable.write(content); await writable.close(); showNotification(currentTranslations.fileSaved); }
            catch (error) { console.error('Error saving file:', error); }
        }
    }
    async function exportProjectAsZip() {
        if (fileState.fileHandles.size === 0) { showNotification(currentTranslations.noFilesToExport); return; }
        const zip = new JSZip();
        for (const [name, handle] of fileState.fileHandles.entries()) zip.file(name, handle.isNew ? handle.content : await (await handle.getFile()).text());
        zip.generateAsync({ type: "blob" }).then(content => { const link = document.createElement('a'); link.href = URL.createObjectURL(content); link.download = `${fileState.dirHandle?.name || 'project'}.zip`; link.click(); URL.revokeObjectURL(link.href); });
    }
    function handleCreateFile() {
        let filename = ui.newFileModal.filename.value.trim(); const preset = ui.newFileModal.preset.value;
        ui.newFileModal.error.textContent = '';
        if (!filename && preset === 'custom') { ui.newFileModal.error.textContent = currentTranslations['error.noFilename']; return; }
        
        let finalFilename;
        if (preset === 'custom') {
            let ext = ui.newFileModal.customExt.value.trim();
            if (ext && !ext.startsWith('.')) ext = '.' + ext;
            finalFilename = filename + ext;
        } else {
            finalFilename = filename ? filename + preset.substring(preset.lastIndexOf('.')) : preset;
        }

        if (fileState.fileHandles.has(finalFilename)) { ui.newFileModal.error.textContent = currentTranslations['error.fileExists']; return; }
        
        const initialContent = fileContentPresets[preset] || '';
        const virtualFile = { name: finalFilename, content: initialContent, isNew: true };
        fileState.fileHandles.set(finalFilename, virtualFile); 
        openFileInEditor(finalFilename); 
        closeNewFileDialog();
    }

    // --- INTERNATIONALIZATION (i18n) & HELPERS ---
    async function loadLanguage(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`); currentTranslations = await response.json(); applyTranslations();
            if (!fileState.activeFile && !fileState.dirHandle) initializeEditor(currentTranslations.welcomeMessage);
            localStorage.setItem('editorLang', lang); ui.statusBar.langSelect.value = lang; ui.settings.langSelect.value = lang;
        } catch (error) { console.error(`Could not load language: ${lang}`, error); if (lang !== defaultLang) loadLanguage(defaultLang); }
    }
    function applyTranslations() {
        ui.i18n.text.forEach(el => { const key = el.dataset.i18nKey; if (currentTranslations[key]) el.textContent = currentTranslations[key]; });
        ui.i18n.title.forEach(el => { const key = el.dataset.i18nKeyTitle; if (currentTranslations[key]) el.title = currentTranslations[key]; });
        ui.i18n.placeholder.forEach(el => { const key = el.dataset.i18nKeyPlaceholder; if (currentTranslations[key]) el.placeholder = currentTranslations[key]; });
        
        const presetOptions = ['index.html', 'style.css', 'script.js', 'main.py', 'app.ts', 'script.sh', 'README.md', 'data.json', 'custom'];
        populateSelect(ui.newFileModal.preset, presetOptions, 'preset');
    }
    function getBrowserLanguage() {
        const savedLang = localStorage.getItem('editorLang'); if (savedLang && supportedLangs.includes(savedLang)) return savedLang;
        const lang = navigator.language.split('-')[0]; return supportedLangs.includes(lang) ? lang : defaultLang;
    }
    function getIconForFile(fileName) { const ext = fileName.split('.').pop(); const map = { js: 'fab fa-js-square', html: 'fab fa-html5', css: 'fab fa-css3-alt', json: 'fas fa-code', md: 'fab fa-markdown', py: 'fab fa-python', ts: 'fas fa-code', sh: 'fas fa-terminal' }; return map[ext] || 'fas fa-file-alt'; }
    function getLanguageForFile(fileName) { const ext = fileName.split('.').pop(); const map = { js: 'javascript', html: 'html', css: 'css', json: 'json', md: 'markdown', ts: 'typescript', py: 'python', java: 'java', sh: 'shell' }; return map[ext] || 'plaintext'; }
    function showNotification(message) {
        let n = document.querySelector('.status-bar-notification'); if (!n) { n = document.createElement('div'); n.className = 'status-bar-notification'; document.body.appendChild(n); }
        n.textContent = message; n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 3000);
    }
    function populateSelect(select, options, prefix = '') {
        const currentValue = select.value;
        select.innerHTML = '';
        options.forEach(val => {
            const opt = document.createElement('option'); opt.value = val; const key = prefix ? `${prefix}.${val}` : val;
            opt.textContent = currentTranslations[key] || val.charAt(0).toUpperCase() + val.slice(1);
            select.appendChild(opt);
        });
        select.value = currentValue;
    }
});