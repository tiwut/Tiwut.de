document.addEventListener('DOMContentLoaded', () => {
    const modelGrid = document.getElementById('model-grid');
    const searchBar = document.getElementById('search-bar');
    const formatFilter = document.getElementById('format-filter');

    // Modal Elements for Image Preview
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const modalImageTitleElement = document.getElementById('modal-image-title');
    const modalImageElement = document.getElementById('modal-image');
    const closeImageModalButton = imageViewerModal.querySelector('.close-button');

    let allModelsData = [];

    function formatModelName(folderName) {
        return folderName
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    async function fetchModels() {
        try {
            console.log("Fetching models from models.txt...");
            const response = await fetch('models.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - Could not load models.txt. (${response.statusText})`);
            }
            const text = await response.text();
            const modelEntries = text.split('\n')
                                     .map(line => line.trim())
                                     .filter(line => line.length > 0 && line.includes(':'));

            allModelsData = modelEntries.map(entry => {
                const mainParts = entry.split('|');
                const nameAndFormats = mainParts[0];
                const assetsString = mainParts.length > 1 ? mainParts[1] : '';

                const [folderName, formatsString] = nameAndFormats.split(':');

                const cleanFolderName = folderName.trim();
                const cleanFormatsString = formatsString ? formatsString.trim() : '';

                const availableFormats = cleanFormatsString.split(',')
                                            .map(f => f.trim().toUpperCase())
                                            .filter(f => f.length > 0);

                const assetFiles = assetsString ? assetsString.split(',')
                                            .map(f => f.trim())
                                            .filter(f => f.length > 0) : [];

                const title = formatModelName(cleanFolderName);

                return {
                    id: cleanFolderName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    name: title,
                    folderName: cleanFolderName,
                    imageUrl: `${cleanFolderName}/main.avif`, // Path to main.avif for preview and card
                    availableFormats: availableFormats,
                    assetFiles: assetFiles, // For ZIP download
                    downloadFiles: availableFormats.map(format => ({
                        format: format,
                        fileName: `${cleanFolderName}.${format.toLowerCase()}`,
                        url: `${cleanFolderName}/${cleanFolderName}.${format.toLowerCase()}`
                    }))
                };
            });
            console.log("Model data processed:", allModelsData);
            displayModels(allModelsData);
        } catch (error) {
            console.error("Error fetching or processing models:", error);
            modelGrid.innerHTML = `<p class="no-models">Could not load models. Please check 'models.txt', folder structure, and console for details.</p>`;
        }
    }

    function displayModels(models) {
        modelGrid.innerHTML = '';

        if (models.length === 0) {
            modelGrid.innerHTML = `<p class="no-models">No models found matching the current criteria.</p>`;
            return;
        }

        models.forEach(model => {
            const card = document.createElement('div');
            card.className = 'model-card';
            card.dataset.modelId = model.id;

            const downloadButtonsHtml = model.downloadFiles.map(file => `
                <a href="${file.url}" download="${file.fileName}" title="Download ${model.name} as ${file.format}">
                    ${file.format}
                </a>
            `).join('');

            const imageSrc = model.imageUrl;
            const placeholderImage = `data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22280%22%20height%3D%22220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20220%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22280%22%20height%3D%22220%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2294.30%22%20y%3D%22116.1%22%3ENo Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E`;

            card.innerHTML = `
                <img src="${imageSrc}" alt="Thumbnail for ${model.name}" onerror="this.onerror=null; this.src='${placeholderImage}'; this.alt='Image not available for ${model.name}';">
                <div class="model-card-content">
                    <div>
                        <h3>${model.name}</h3>
                    </div>
                    <div class="model-actions">
                        <button class="image-preview-button" data-modelname="${model.name}" data-imagesrc="${model.imageUrl}">View Image</button>
                        <button class="download-zip-button" data-modelid="${model.id}" title="Download model, main image, and associated texture/material files.">Download All (ZIP)</button>
                        ${downloadButtonsHtml.length > 0 ? `<div class="download-buttons">${downloadButtonsHtml}</div>` : '<p style="font-size:0.9em; color:#777; text-align:center;">No download formats defined.</p>'}
                    </div>
                </div>
            `;
            modelGrid.appendChild(card);
        });

        document.querySelectorAll('.image-preview-button').forEach(button => {
            button.addEventListener('click', function() {
                const modelName = this.dataset.modelname;
                const imageSrc = this.dataset.imagesrc;
                openImageModal(modelName, imageSrc);
            });
        });

        document.querySelectorAll('.download-zip-button').forEach(button => {
            button.addEventListener('click', function() {
                const modelId = this.dataset.modelid;
                const modelData = allModelsData.find(m => m.id === modelId);
                if (modelData) {
                    handleDownloadZip(modelData, this);
                } else {
                    console.error("Could not find model data for ZIP download:", modelId);
                    alert("Error: Could not prepare ZIP file. Model data not found.");
                }
            });
        });
    }

    function openImageModal(modelName, src) {
        modalImageTitleElement.textContent = `Preview: ${modelName}`;
        modalImageElement.src = src;
        modalImageElement.alt = `Enlarged preview of ${modelName}`;

        modalImageElement.onerror = function() {
            console.error(`Error loading image '${src}' in modal.`);
            modalImageElement.alt = `Image for ${modelName} could not be loaded.`;
            // modalImageElement.src = 'path/to/your/error-placeholder.png'; // Optional
        };
         modalImageElement.onload = function() { // Reset alt text on successful load
            modalImageElement.alt = `Enlarged preview of ${modelName}`;
        };

        imageViewerModal.style.display = "block";
        document.body.style.overflow = 'hidden';
    }

    function closeImageModal() {
        imageViewerModal.style.display = "none";
        if (modalImageElement) {
            modalImageElement.src = ""; // Clear src to free memory
            modalImageElement.alt = "";
        }
        document.body.style.overflow = 'auto';
    }

    closeImageModalButton.onclick = closeImageModal;
    window.onclick = function(event) { if (event.target == imageViewerModal) closeImageModal(); }
    window.addEventListener('keydown', function(event) { if (event.key === 'Escape' && imageViewerModal.style.display === "block") closeImageModal(); });

    async function handleDownloadZip(model, button) {
        console.log("Preparing ZIP for:", model.name, "Assets to include:", model.assetFiles);
        const originalButtonText = button.innerHTML;
        button.innerHTML = `Processing... <span class="spinner"></span>`;
        button.disabled = true;

        const zip = new JSZip();
        const modelFolderInZip = zip.folder(model.folderName);

        try {
            // 1. Add main.avif
            const imgResponse = await fetch(model.imageUrl);
            if (!imgResponse.ok) throw new Error(`Failed to fetch ${model.imageUrl}: ${imgResponse.statusText}`);
            const imgBlob = await imgResponse.blob();
            modelFolderInZip.file("main.avif", imgBlob);

            // 2. Add defined 3D model files for download
            for (const fileInfo of model.downloadFiles) {
                const fileResponse = await fetch(fileInfo.url);
                if (!fileResponse.ok) throw new Error(`Failed to fetch ${fileInfo.url}: ${fileResponse.statusText}`);
                const fileBlob = await fileResponse.blob();
                modelFolderInZip.file(fileInfo.fileName, fileBlob);
            }

            // 3. Add asset files (textures, mtl, etc.)
            for (const assetFileName of model.assetFiles) {
                const assetUrl = `${model.folderName}/${assetFileName}`;
                const assetResponse = await fetch(assetUrl);
                 if (!assetResponse.ok) {
                    console.warn(`Could not fetch asset ${assetUrl}: ${assetResponse.statusText}. Skipping for ZIP.`);
                    continue;
                }
                const assetBlob = await assetResponse.blob();
                modelFolderInZip.file(assetFileName, assetBlob);
            }

            const zipContent = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipContent);
            link.download = `${model.folderName}_all_files.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error("Error creating ZIP file for:", model.name, error);
            alert(`Error creating ZIP for ${model.name}: ${error.message}. Check console for details.`);
        } finally {
            button.innerHTML = originalButtonText;
            button.disabled = false;
        }
    }

    function filterAndSearchModels() {
        const searchTerm = searchBar.value.toLowerCase().trim();
        const selectedFormat = formatFilter.value.toUpperCase();
        let filteredModels = allModelsData;

        if (searchTerm) {
            filteredModels = filteredModels.filter(model => model.name.toLowerCase().includes(searchTerm));
        }
        if (selectedFormat !== "ALL") {
            filteredModels = filteredModels.filter(model => model.availableFormats.includes(selectedFormat));
        }
        displayModels(filteredModels);
    }

    searchBar.addEventListener('input', filterAndSearchModels);
    formatFilter.addEventListener('change', filterAndSearchModels);

    fetchModels();
});