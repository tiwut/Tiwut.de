document.addEventListener('DOMContentLoaded', () => {
    // --- 1. I18N (INTERNATIONALIZATION) SETUP ---
    const translations = {
        en: {
            pageTitle: "Browser Performance & Stats Test",
            mainTitle: "Browser Benchmark",
            toggleTheme: "Toggle light/dark theme",
            browserInfoTitle: "Your Browser Information",
            userAgentLabel: "User Agent:",
            vendorLabel: "Browser Vendor:",
            languageLabel: "Language:",
            platformLabel: "Platform/OS:",
            cookiesLabel: "Cookies Enabled:",
            resolutionLabel: "Screen Resolution:",
            singleBenchmarksTitle: "Single Benchmarks",
            cpuTestLabel: "CPU / JavaScript Test",
            cpuTestDesc: "Measures performance by running millions of math operations.",
            domTestLabel: "DOM Manipulation Test",
            domTestDesc: "Measures performance by adding and removing thousands of elements.",
            graphicsTestLabel: "Graphics (2D Canvas) Test",
            graphicsTestDesc: "Measures 2D rendering performance by drawing thousands of shapes.",
            startTest: "Start Test",
            statsTitle: "Statistical Analysis (Multiple Runs)",
            runCountLabel: "Number of runs:",
            cpuStatsLabel: "CPU Statistics",
            domStatsLabel: "DOM Statistics",
            graphicsStatsLabel: "Graphics Statistics",
            startStatTest: "Start Analysis",
            downloadReportTitle: "Download Report",
            downloadReportDesc: "Generates a PDF report with browser info and statistical results.",
            downloadPdfBtn: "Download PDF Report",
            // Dynamic text
            yes: "Yes",
            no: "No",
            notAvailable: "Not Available",
            testRunning: "Test running...",
            testFinishedIn: "Finished in {duration} ms",
            statRunning: "Running test {current} of {total}...",
            statResults: "Results after {runs} runs:\nBest (min):   {min} ms\nWorst (max):  {max} ms\nAverage (avg):{avg} ms\nStd. Dev.:    {stdDev} ms",
            // PDF Text
            pdfTitle: "Browser Performance Report",
            pdfGeneratedOn: "Generated on:",
            pdfBrowserInfo: "Browser Information",
            pdfStatResults: "Statistical Results",
            pdfTestRuns: "({runs} runs)",
            pdfBest: "Best",
            pdfWorst: "Worst",
            pdfAverage: "Average",
            pdfStdDev: "Std. Dev.",
            pdfNoStats: "No statistical tests were performed.",
        },
        de: {
            pageTitle: "Browser-Leistungstest & Statistik",
            mainTitle: "Browser-Benchmark",
            toggleTheme: "Helles/Dunkles Design umschalten",
            browserInfoTitle: "Deine Browser-Informationen",
            userAgentLabel: "User Agent:",
            vendorLabel: "Browser-Hersteller:",
            languageLabel: "Sprache:",
            platformLabel: "Plattform/OS:",
            cookiesLabel: "Cookies aktiviert:",
            resolutionLabel: "Bildschirmauflösung:",
            singleBenchmarksTitle: "Einzelne Benchmarks",
            cpuTestLabel: "CPU / JavaScript-Test",
            cpuTestDesc: "Misst die Leistung durch Millionen von mathematischen Operationen.",
            domTestLabel: "DOM-Manipulationstest",
            domTestDesc: "Misst die Leistung durch Hinzufügen und Entfernen von Tausenden von Elementen.",
            graphicsTestLabel: "Grafik-Test (2D Canvas)",
            graphicsTestDesc: "Misst die 2D-Rendering-Leistung durch Zeichnen von Tausenden von Formen.",
            startTest: "Test starten",
            statsTitle: "Statistische Auswertung (Mehrfach-Durchlauf)",
            runCountLabel: "Anzahl der Durchläufe:",
            cpuStatsLabel: "CPU-Statistik",
            domStatsLabel: "DOM-Statistik",
            graphicsStatsLabel: "Grafik-Statistik",
            startStatTest: "Analyse starten",
            downloadReportTitle: "Bericht herunterladen",
            downloadReportDesc: "Erstellt einen PDF-Bericht mit Browser-Infos und statistischen Ergebnissen.",
            downloadPdfBtn: "PDF-Bericht herunterladen",
            // Dynamic text
            yes: "Ja",
            no: "Nein",
            notAvailable: "Nicht verfügbar",
            testRunning: "Test läuft...",
            testFinishedIn: "Abgeschlossen in {duration} ms",
            statRunning: "Laufe Test {current} von {total}...",
            statResults: "Ergebnisse nach {runs} Durchläufen:\nBester (min):   {min} ms\nSchlechtester (max):{max} ms\nDurchschnitt (avg): {avg} ms\nStandardabw.:   {stdDev} ms",
            // PDF Text
            pdfTitle: "Browser-Leistungsbericht",
            pdfGeneratedOn: "Erstellt am:",
            pdfBrowserInfo: "Browser-Informationen",
            pdfStatResults: "Statistische Ergebnisse",
            pdfTestRuns: "({runs} Durchläufe)",
            pdfBest: "Bester",
            pdfWorst: "Schlechtester",
            pdfAverage: "Durchschnitt",
            pdfStdDev: "Standardabw.",
            pdfNoStats: "Es wurden keine statistischen Tests durchgeführt.",
        },
        es: {
            pageTitle: "Prueba de Rendimiento y Estadísticas del Navegador",
            mainTitle: "Benchmark del Navegador",
            toggleTheme: "Alternar tema claro/oscuro",
            browserInfoTitle: "La Información de tu Navegador",
            userAgentLabel: "User Agent:",
            vendorLabel: "Fabricante del Navegador:",
            languageLabel: "Idioma:",
            platformLabel: "Plataforma/SO:",
            cookiesLabel: "Cookies Habilitadas:",
            resolutionLabel: "Resolución de Pantalla:",
            singleBenchmarksTitle: "Benchmarks Individuales",
            cpuTestLabel: "Prueba de CPU / JavaScript",
            cpuTestDesc: "Mide el rendimiento ejecutando millones de operaciones matemáticas.",
            domTestLabel: "Prueba de Manipulación del DOM",
            domTestDesc: "Mide el rendimiento añadiendo y eliminando miles de elementos.",
            graphicsTestLabel: "Prueba de Gráficos (Canvas 2D)",
            graphicsTestDesc: "Mide el rendimiento de renderizado 2D dibujando miles de formas.",
            startTest: "Iniciar Prueba",
            statsTitle: "Análisis Estadístico (Múltiples Ejecuciones)",
            runCountLabel: "Número de ejecuciones:",
            cpuStatsLabel: "Estadísticas de CPU",
            domStatsLabel: "Estadísticas de DOM",
            graphicsStatsLabel: "Estadísticas de Gráficos",
            startStatTest: "Iniciar Análisis",
            downloadReportTitle: "Descargar Informe",
            downloadReportDesc: "Genera un informe PDF con información del navegador y resultados estadísticos.",
            downloadPdfBtn: "Descargar Informe PDF",
            // Dynamic text
            yes: "Sí",
            no: "No",
            notAvailable: "No Disponible",
            testRunning: "Prueba en curso...",
            testFinishedIn: "Finalizado en {duration} ms",
            statRunning: "Ejecutando prueba {current} de {total}...",
            statResults: "Resultados después de {runs} ejecuciones:\nMejor (min):   {min} ms\nPeor (max):  {max} ms\nPromedio (avg):{avg} ms\nDesv. Estándar: {stdDev} ms",
            // PDF Text
            pdfTitle: "Informe de Rendimiento del Navegador",
            pdfGeneratedOn: "Generado el:",
            pdfBrowserInfo: "Información del Navegador",
            pdfStatResults: "Resultados Estadísticos",
            pdfTestRuns: "({runs} ejecuciones)",
            pdfBest: "Mejor",
            pdfWorst: "Peor",
            pdfAverage: "Promedio",
            pdfStdDev: "Desv. Est.",
            pdfNoStats: "No se realizaron pruebas estadísticas.",
        }
    };
    
    let currentLang = 'en';

    function setLanguage(lang) {
        currentLang = translations[lang] ? lang : 'en';
        localStorage.setItem('preferredLanguage', currentLang);
        document.documentElement.lang = currentLang;
        
        const t = translations[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (t[key]) el.title = t[key];
        });
        
        // Update dynamic info that depends on language
        displayBrowserInfo();
    }

    // --- 2. THEME SETUP ---
    function setTheme(theme) {
        localStorage.setItem('preferredTheme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').checked = (theme === 'dark');
    }

    // --- 3. CORE BENCHMARK LOGIC ---
    const { jsPDF } = window.jspdf;
    const statisticsData = { cpu: null, dom: null, graphics: null };

    const testFunctions = {
        cpu: () => { let r = 0; for (let i = 0; i < 50000000; i++) { r += Math.sqrt(i) * Math.sin(i); } },
        dom: () => {
            const area = document.getElementById('dom-test-area');
            const frag = document.createDocumentFragment();
            for (let i = 0; i < 20000; i++) { frag.appendChild(document.createElement('li')); }
            area.appendChild(frag);
            area.innerHTML = '';
        },
        graphics: () => {
            const canvas = document.getElementById('graphics-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 10000; i++) {
                ctx.fillStyle = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
                ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 10, 10);
            }
        }
    };
    
    function runTestAsync(testFunc) {
        return new Promise(resolve => setTimeout(() => {
            const start = performance.now();
            testFunc();
            resolve(performance.now() - start);
        }, 0));
    }

    function calculateStats(results) {
        const sum = results.reduce((a, b) => a + b, 0);
        const avg = sum / results.length;
        const min = Math.min(...results);
        const max = Math.max(...results);
        const stdDev = Math.sqrt(results.reduce((a, b) => a + (b - avg) ** 2, 0) / results.length);
        return { runs: results.length, min: min.toFixed(2), max: max.toFixed(2), avg: avg.toFixed(2), stdDev: stdDev.toFixed(2) };
    }
    
    function setAllButtonsDisabled(disabled) {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.id !== 'download-pdf-btn') btn.disabled = disabled;
        });
    }

    // --- 4. UI & EVENT HANDLERS ---
    function displayBrowserInfo() {
        const t = translations[currentLang];
        document.getElementById('user-agent').textContent = navigator.userAgent;
        document.getElementById('vendor').textContent = navigator.vendor || t.notAvailable;
        document.getElementById('language').textContent = navigator.language;
        document.getElementById('platform').textContent = navigator.platform;
        document.getElementById('cookies-enabled').textContent = navigator.cookieEnabled ? t.yes : t.no;
        document.getElementById('screen-resolution').textContent = `${screen.width} x ${screen.height}`;
    }

    async function runSingleTest(testType, button, resultElement) {
        button.disabled = true;
        resultElement.textContent = translations[currentLang].testRunning;
        const duration = await runTestAsync(testFunctions[testType]);
        resultElement.textContent = translations[currentLang].testFinishedIn.replace('{duration}', duration.toFixed(2));
        button.disabled = false;
    }

    async function runStatisticsForTest(testType, resultElement) {
        setAllButtonsDisabled(true);
        const runCount = parseInt(document.getElementById('run-count').value, 10);
        const results = [];
        const t = translations[currentLang];

        for (let i = 1; i <= runCount; i++) {
            resultElement.textContent = t.statRunning.replace('{current}', i).replace('{total}', runCount);
            results.push(await runTestAsync(testFunctions[testType]));
        }

        const stats = calculateStats(results);
        statisticsData[testType] = stats;
        
        resultElement.innerHTML = `<pre>${t.statResults
            .replace('{runs}', stats.runs)
            .replace('{min}', stats.min)
            .replace('{max}', stats.max)
            .replace('{avg}', stats.avg)
            .replace('{stdDev}', stats.stdDev)}</pre>`;
        
        setAllButtonsDisabled(false);
        document.getElementById('download-pdf-btn').disabled = false;
    }

    function generatePdf() {
        const doc = new jsPDF();
        const t = translations[currentLang];
        let y = 20;

        doc.setFontSize(18).text(t.pdfTitle, 105, y, { align: 'center' });
        y += 10;
        doc.setFontSize(10).text(`${t.pdfGeneratedOn} ${new Date().toLocaleString(currentLang)}`, 105, y, { align: 'center' });
        y += 15;

        doc.setFontSize(14).text(t.pdfBrowserInfo, 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`${t.userAgentLabel} ${navigator.userAgent}`, 14, y, { maxWidth: 180 });
        y += 12;
        doc.text(`${t.vendorLabel} ${navigator.vendor || t.notAvailable}`, 14, y);
        y += 7;
        doc.text(`${t.platformLabel} ${navigator.platform}`, 14, y);
        y += 15;

        doc.setFontSize(14).text(t.pdfStatResults, 14, y);
        y += 8;
        
        let hasStats = false;
        Object.keys(statisticsData).forEach(key => {
            const data = statisticsData[key];
            if (data) {
                hasStats = true;
                doc.setFontSize(12).text(`${translations[currentLang][key+'StatsLabel']} ${t.pdfTestRuns.replace('{runs}', data.runs)}`, 14, y);
                y += 7;
                doc.setFontSize(10);
                doc.text(
                    `${t.pdfBest}: ${data.min}ms | ${t.pdfWorst}: ${data.max}ms | ${t.pdfAverage}: ${data.avg}ms | ${t.pdfStdDev}: ${data.stdDev}ms`, 
                    14, y
                );
                y += 12;
            }
        });

        if (!hasStats) doc.text(t.pdfNoStats, 14, y);
        
        doc.save('Browser-Performance-Report.pdf');
    }

    // --- 5. INITIALIZATION ---
    // Language
    const languageSwitcher = document.getElementById('language-switcher');
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.split('-')[0];
    const initialLang = savedLang || (translations[browserLang] ? browserLang : 'en');
    languageSwitcher.value = initialLang;
    setLanguage(initialLang);
    languageSwitcher.addEventListener('change', () => setLanguage(languageSwitcher.value));

    // Theme
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('preferredTheme');
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    themeToggle.addEventListener('change', () => setTheme(themeToggle.checked ? 'dark' : 'light'));

    // Test Buttons
    document.getElementById('start-cpu-test').addEventListener('click', e => runSingleTest('cpu', e.target, document.getElementById('cpu-result')));
    document.getElementById('start-dom-test').addEventListener('click', e => runSingleTest('dom', e.target, document.getElementById('dom-result')));
    document.getElementById('start-graphics-test').addEventListener('click', e => runSingleTest('graphics', e.target, document.getElementById('graphics-result')));
    
    document.getElementById('start-cpu-stat-test').addEventListener('click', () => runStatisticsForTest('cpu', document.getElementById('cpu-stat-result')));
    document.getElementById('start-dom-stat-test').addEventListener('click', () => runStatisticsForTest('dom', document.getElementById('dom-stat-result')));
    document.getElementById('start-graphics-stat-test').addEventListener('click', () => runStatisticsForTest('graphics', document.getElementById('graphics-stat-result')));

    document.getElementById('download-pdf-btn').addEventListener('click', generatePdf);
});