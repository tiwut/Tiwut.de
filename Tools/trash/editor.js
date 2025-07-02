document.addEventListener('DOMContentLoaded', () => {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;

    const pdfUpload = document.getElementById('pdf-upload');
    const pageContainer = document.getElementById('page-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const saveButton = document.getElementById('save-pdf');
    const drawToolButton = document.getElementById('tool-draw');
    const textToolButton = document.getElementById('tool-text');
    const colorPicker = document.getElementById('color-picker');
    const lineWidthInput = document.getElementById('line-width');
    const controls = document.getElementById('controls'); // Get the controls div

    // Create and add the Cover Area tool button
    const coverToolButton = document.createElement('button');
    coverToolButton.id = 'tool-cover';
    coverToolButton.textContent = 'Cover Area';
    // Insert it after the text tool button for logical grouping
    textToolButton.parentNode.insertBefore(coverToolButton, textToolButton.nextSibling);


    let pdfDoc = null;
    let currentTool = 'draw'; // 'draw', 'text', or 'cover'
    let drawing = false; // Used for draw and cover tools
    let pagesData = []; // To store { baseCanvas, annotationCanvas, annotationCtx } for each page
    let coverRectStart = {}; // To store start coordinates for cover rectangle

    drawToolButton.addEventListener('click', () => currentTool = 'draw');
    textToolButton.addEventListener('click', () => currentTool = 'text');
    coverToolButton.addEventListener('click', () => {
        currentTool = 'cover';
        // Optional: Change cursor for cover tool
        pagesData.forEach(pd => pd.annotationCanvas.style.cursor = 'crosshair');
    });


    pdfUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a PDF file.');
            return;
        }

        pageContainer.innerHTML = ''; // Clear previous PDF
        pagesData = [];
        loadingIndicator.style.display = 'block';

        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            try {
                pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
                renderAllPages();
            } catch (error) {
                console.error("Error loading PDF:", error);
                alert("Error loading PDF: " + error.message);
                loadingIndicator.style.display = 'none';
            }
        };
        fileReader.readAsArrayBuffer(file);
    });

    async function renderAllPages() {
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            await renderPage(pageNum);
        }
        loadingIndicator.style.display = 'none';
        // Set initial cursor for the first tool
        if (currentTool === 'cover') {
             pagesData.forEach(pd => pd.annotationCanvas.style.cursor = 'crosshair');
        } else {
             pagesData.forEach(pd => pd.annotationCanvas.style.cursor = 'crosshair'); // Default crosshair
        }
    }

    async function renderPage(pageNum) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page-wrapper';
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.height = `${viewport.height}px`;

        const baseCanvas = document.createElement('canvas');
        baseCanvas.className = 'page-canvas';
        const baseCtx = baseCanvas.getContext('2d');
        baseCanvas.height = viewport.height;
        baseCanvas.width = viewport.width;

        const annotationCanvas = document.createElement('canvas');
        annotationCanvas.className = 'annotation-canvas';
        const annotationCtx = annotationCanvas.getContext('2d');
        annotationCanvas.height = viewport.height;
        annotationCanvas.width = viewport.width;

        pageWrapper.appendChild(baseCanvas);
        pageWrapper.appendChild(annotationCanvas);
        pageContainer.appendChild(pageWrapper);

        pagesData.push({ baseCanvas, annotationCanvas, annotationCtx, originalPage: page });

        const renderContext = {
            canvasContext: baseCtx,
            viewport: viewport
        };
        await page.render(renderContext).promise;

        setupAnnotationEvents(annotationCanvas, annotationCtx, pageNum -1);
    }

    function setupAnnotationEvents(canvas, ctx, pageIndex) {
        let lastX, lastY;

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (currentTool === 'draw') {
                drawing = true;
                lastX = x;
                lastY = y;
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
            } else if (currentTool === 'text') {
                const text = prompt("Enter text to add:");
                if (text) {
                    ctx.font = `${lineWidthInput.value * 5}px Arial`; // Simple font size logic
                    ctx.fillStyle = colorPicker.value; // Use selected color for text
                    ctx.fillText(text, x, y);
                }
            } else if (currentTool === 'cover') {
                drawing = true;
                coverRectStart.x = x;
                coverRectStart.y = y;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (currentTool === 'draw') {
                ctx.lineTo(x, y);
                ctx.strokeStyle = colorPicker.value;
                ctx.lineWidth = lineWidthInput.value;
                ctx.stroke();
                lastX = x;
                lastY = y;
            } else if (currentTool === 'cover') {
                // Optional: live preview of the rectangle being drawn
                // For simplicity, we will draw it only on mouseup
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (!drawing && currentTool !== 'text') return; // drawing is false for text tool after prompt

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (currentTool === 'draw') {
                drawing = false;
                // No need for closePath if it's just lines, but good for filled shapes
                // ctx.closePath();
            } else if (currentTool === 'cover') {
                drawing = false;
                const rectX = Math.min(coverRectStart.x, x);
                const rectY = Math.min(coverRectStart.y, y);
                const rectWidth = Math.abs(x - coverRectStart.x);
                const rectHeight = Math.abs(y - coverRectStart.y);

                if (rectWidth > 0 && rectHeight > 0) {
                    // For "Cover Area", we usually want a color that matches the page background.
                    // Defaulting to white. A color picker for this would be an enhancement.
                    ctx.fillStyle = "white";
                    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
                }
            }
        });

        canvas.addEventListener('mouseleave', () => {
             if (drawing && (currentTool === 'draw' || currentTool === 'cover')) {
                drawing = false;
             }
        });
    }

    saveButton.addEventListener('click', async () => {
        if (!pdfDoc || pagesData.length === 0) {
            alert("Please load a PDF first.");
            return;
        }

        loadingIndicator.style.display = 'block';
        try {
            const newPdfDoc = await PDFDocument.create();

            for (let i = 0; i < pagesData.length; i++) {
                const { baseCanvas, annotationCanvas, originalPage } = pagesData[i];
                const { width, height } = originalPage.getViewport({ scale: 1.0 }); // Use original dimensions for pdf-lib

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = baseCanvas.width;
                tempCanvas.height = baseCanvas.height;
                const tempCtx = tempCanvas.getContext('2d');

                tempCtx.drawImage(baseCanvas, 0, 0);
                tempCtx.drawImage(annotationCanvas, 0, 0);

                const pngImageBytes = await new Promise(resolve => tempCanvas.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(new Uint8Array(reader.result));
                    reader.readAsArrayBuffer(blob);
                }, 'image/png'));

                const pngImage = await newPdfDoc.embedPng(pngImageBytes);
                const page = newPdfDoc.addPage([width, height]);

                page.drawImage(pngImage, {
                    x: 0,
                    y: 0,
                    width: page.getWidth(),
                    height: page.getHeight(),
                });
            }

            const pdfBytes = await newPdfDoc.save();
            download(pdfBytes, "annotated_document.pdf", "application/pdf");

        } catch (error) {
            console.error("Error saving PDF:", error);
            alert("Error saving PDF: " + error.message);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    function download(data, filename, type) {
        const blob = new Blob([data], { type: type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
});