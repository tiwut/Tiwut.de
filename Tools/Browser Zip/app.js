document.addEventListener('DOMContentLoaded', () => {
    const filesToZipInput = document.getElementById('filesToZip');
    const zipFileNameInput = document.getElementById('zipFileName');
    const createZipButton = document.getElementById('createZipButton');
    const zipProgressContainer = document.getElementById('zipProgressContainer');
    const zipProgress = document.getElementById('zipProgress');
    const zipProgressText = document.getElementById('zipProgressText');

    const zipToExtractInput = document.getElementById('zipToExtract');
    const extractZipButton = document.getElementById('extractZipButton');
    const extractProgressContainer = document.getElementById('extractProgressContainer');
    const extractProgress = document.getElementById('extractProgress');
    const extractProgressText = document.getElementById('extractProgressText');

    const statusDiv = document.getElementById('status');

    function updateStatus(message, type = 'info', autoHideDelay = 0) {
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`; // e.g., status-message success
        statusDiv.style.display = 'block';
        console.log(`Status (${type}): ${message}`);

        // Clear any existing timeout
        if (statusDiv.timeoutId) {
            clearTimeout(statusDiv.timeoutId);
        }

        if (autoHideDelay > 0) {
            statusDiv.timeoutId = setTimeout(() => {
                statusDiv.style.display = 'none';
            }, autoHideDelay);
        }
    }

    function disableButtons() {
        createZipButton.disabled = true;
        extractZipButton.disabled = true;
    }

    function enableButtons() {
        createZipButton.disabled = false;
        extractZipButton.disabled = false;
    }

    function showProgress(container, bar, textElement, message = "Processing...") {
        container.style.display = 'block';
        bar.value = 0;
        textElement.textContent = message + ' (0%)';
    }

    function updateProgress(bar, textElement, percent, messagePrefix = "Processing...") {
        const p = Math.floor(percent);
        bar.value = p;
        textElement.textContent = `${messagePrefix} (${p}%)`;
    }

    function hideProgress(container) {
        container.style.display = 'none';
    }

    // --- Create ZIP Logic ---
    createZipButton.addEventListener('click', async () => {
        if (!filesToZipInput.files.length) {
            updateStatus('Please select files to add to the ZIP.', 'error', 5000);
            return;
        }

        const zipFileName = zipFileNameInput.value.trim() || 'archive.zip';
        if (!zipFileName.toLowerCase().endsWith('.zip')) {
            updateStatus('ZIP file name must end with .zip', 'error', 5000);
            return;
        }

        updateStatus('Starting ZIP creation...', 'info');
        showProgress(zipProgressContainer, zipProgress, zipProgressText, "Compressing");
        disableButtons();

        const zip = new JSZip();

        for (const file of filesToZipInput.files) {
            zip.file(file.name, file);
        }

        try {
            const content = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 6 // Good balance of speed and compression
                },
                progressCallback: (metadata) => {
                    updateProgress(zipProgress, zipProgressText, metadata.percent,
                        metadata.currentFile ? `Compressing: ${metadata.currentFile}` : "Finalizing archive");
                }
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = zipFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            updateStatus(`Successfully created and downloaded ${zipFileName}.`, 'success', 7000);
            filesToZipInput.value = ''; // Clear file input
        } catch (err) {
            updateStatus(`Error creating ZIP: ${err.message}`, 'error');
            console.error(err);
        } finally {
            hideProgress(zipProgressContainer);
            enableButtons();
        }
    });

    // --- Extract ZIP Logic ---
    extractZipButton.addEventListener('click', async () => {
        if (!zipToExtractInput.files.length) {
            updateStatus('Please select a ZIP file to extract.', 'error', 5000);
            return;
        }

        const file = zipToExtractInput.files[0];
        if (!file.name.toLowerCase().endsWith('.zip')) {
            updateStatus('Please select a valid .zip file.', 'error', 5000);
            return;
        }

        updateStatus(`Preparing to extract ${file.name}...`, 'info');
        showProgress(extractProgressContainer, extractProgress, extractProgressText, "Loading ZIP");
        disableButtons();

        const reader = new FileReader();

        reader.onload = async function(event) {
            try {
                const zip = await JSZip.loadAsync(event.target.result, {
                    progressCallback: (metadata) => {
                        updateProgress(extractProgress, extractProgressText, metadata.percent, "Loading ZIP structure");
                    }
                });

                const filesToExtract = Object.values(zip.files).filter(entry => !entry.dir);
                const totalFiles = filesToExtract.length;
                let filesProcessed = 0;

                if (totalFiles === 0) {
                    updateStatus(`No files found to extract in ${file.name}. It might be empty.`, 'info', 7000);
                    hideProgress(extractProgressContainer);
                    enableButtons();
                    return;
                }

                updateStatus(`Extracting ${totalFiles} file(s). Downloads will start automatically.`, 'info');

                for (const zipEntry of filesToExtract) {
                    filesProcessed++;
                    const overallPercent = (filesProcessed / totalFiles) * 100;
                    updateProgress(extractProgress, extractProgressText, overallPercent, `Extracting: ${zipEntry.name}`);

                    // Allow UI to update
                    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

                    const fileData = await zipEntry.async("blob");

                    // Create a link and click it to trigger download
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(fileData);
                    link.download = zipEntry.name; // Use the original file name
                    document.body.appendChild(link); // Necessary for Firefox
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href); // Clean up

                    // Small delay between downloads to prevent browser overload/blocking
                    if (filesProcessed < totalFiles) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }

                updateStatus(`Successfully extracted and initiated downloads for ${filesProcessed} file(s) from ${file.name}.`, 'success', 10000);

            } catch (err) {
                updateStatus(`Error extracting ZIP: ${err.message}. File might be corrupt or invalid.`, 'error');
                console.error(err);
            } finally {
                hideProgress(extractProgressContainer);
                enableButtons();
            }
        };

        reader.onerror = function() {
            updateStatus('Error reading the selected ZIP file.', 'error');
            hideProgress(extractProgressContainer);
            enableButtons();
        };

        reader.readAsArrayBuffer(file);
        zipToExtractInput.value = ''; // Clear file input
    });
});