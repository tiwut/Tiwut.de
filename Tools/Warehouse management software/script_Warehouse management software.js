document.addEventListener('DOMContentLoaded', () => {
    const productTableBody = document.getElementById('productTable').getElementsByTagName('tbody')[0];
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

    // Modal elements
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    const closeButton = document.querySelector('.close-button');
    const cancelModalButton = document.getElementById('cancelModalButton');

    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName'); // Changed from produktname
    const locationCodeInput = document.getElementById('locationCode'); // Changed from lagerplatz
    const quantityInput = document.getElementById('quantity'); // Changed from stueckzahl
    const conditionInput = document.getElementById('condition'); // Changed from zustand
    const brandInput = document.getElementById('brand'); // Changed from marke
    const featuresInput = document.getElementById('features'); // Changed from eigenschaften
    const hashtagsInput = document.getElementById('hashtags'); // Kept as is, common term

    let inventoryData = []; // Holds the data
    let selectedProductId = null;
    let currentEditProduct = null;
    let unsavedChanges = false;

    // --- Helper Functions ---
    function generateUUID() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
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
            downloadJsonButton.classList.add('unsaved'); // You might want a CSS class for this
            downloadJsonButton.textContent = "Download Changes as JSON*";
        } else {
            downloadJsonButton.classList.remove('unsaved');
            downloadJsonButton.textContent = "Download Changes as JSON";
        }
    }

    // --- File Load/Save (Download) ---
    jsonFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (unsavedChanges) {
                if (!confirm("There are unsaved changes. Do you want to load a new file anyway? Unsaved changes will be lost.")) {
                    jsonFileInput.value = ""; // Reset input
                    return;
                }
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    if (Array.isArray(jsonData)) {
                        inventoryData = jsonData;
                        renderTable();
                        lastLoadedFileDisplay.textContent = `Loaded: ${file.name} (${new Date().toLocaleTimeString()})`;
                        setUnsavedChanges(false);
                        alert(`"${file.name}" loaded successfully.`);
                    } else {
                        alert("Error: The JSON file does not contain an array of products.");
                    }
                } catch (error) {
                    alert(`Error parsing JSON file: ${error.message}`);
                    console.error("JSON Parse Error:", error);
                }
            };
            reader.onerror = () => {
                alert("Error reading file.");
            };
            reader.readAsText(file);
        }
    });

    downloadJsonButton.addEventListener('click', () => {
        if (inventoryData.length === 0) {
            alert("There is no data to download.");
            return;
        }
        const jsonDataStr = JSON.stringify(inventoryData, null, 4); // 4 for pretty print
        const blob = new Blob([jsonDataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory_data.json'; // Suggested filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setUnsavedChanges(false);
        alert("The 'inventory_data.json' file is being downloaded. Please save it to a suitable location (e.g., overwrite the old file).");
    });


    // --- Table Rendering ---
    function renderTable(filterFn = null) {
        productTableBody.innerHTML = '';
        const dataToRender = filterFn ? inventoryData.filter(filterFn) : inventoryData;

        dataToRender.forEach(product => {
            const row = productTableBody.insertRow();
            row.setAttribute('data-id', product.id);

            // Using English keys from JSON
            row.insertCell().textContent = product.productName || '';
            row.insertCell().textContent = product.locationCode || '';
            row.insertCell().textContent = product.quantity !== undefined ? product.quantity : '';
            row.insertCell().textContent = product.condition || '';
            row.insertCell().textContent = product.lastUpdated || '';
            row.insertCell().textContent = product.brand || '';
            row.insertCell().textContent = product.features || '';
            row.insertCell().textContent = product.hashtags || '';

            row.addEventListener('click', () => selectRow(row, product.id));
            row.addEventListener('dblclick', () => openEditModal(product));
        });
        updateButtonStates();
    }

    function selectRow(row, productId) {
        const previouslySelected = document.querySelector('#productTable tbody tr.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        if (selectedProductId === productId) {
            selectedProductId = null;
        } else {
            row.classList.add('selected');
            selectedProductId = productId;
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

    // --- Modal Open/Close ---
    function openModal(title, product = null) {
        modalTitle.textContent = title;
        currentEditProduct = product;
        productForm.reset();

        if (product) { // Edit mode
            productIdInput.value = product.id;
            productNameInput.value = product.productName || '';
            locationCodeInput.value = product.locationCode || '';
            quantityInput.value = product.quantity !== undefined ? product.quantity : 0;
            conditionInput.value = product.condition || 'New';
            brandInput.value = product.brand || '';
            featuresInput.value = product.features || '';
            hashtagsInput.value = product.hashtags || '';
        } else { // Add mode
            productIdInput.value = '';
            conditionInput.value = 'New'; // Default
            quantityInput.value = 0;
        }
        modal.style.display = 'block';
        productNameInput.focus(); // Focus on the first field
    }

    function closeModal() {
        modal.style.display = 'none';
        currentEditProduct = null;
    }

    // --- CRUD Operations (Client-side) ---
    function handleFormSubmit(event) {
        event.preventDefault();
        const product = {
            id: productIdInput.value || generateUUID(),
            productName: productNameInput.value.trim(),
            locationCode: locationCodeInput.value.trim(),
            quantity: parseInt(quantityInput.value, 10),
            condition: conditionInput.value,
            brand: brandInput.value.trim(),
            features: featuresInput.value.trim(),
            hashtags: hashtagsInput.value.trim(),
            lastUpdated: getCurrentTimestamp()
        };

        if (!product.productName) {
            alert("Product name is required.");
            return;
        }
        if (isNaN(product.quantity) || product.quantity < 0) {
            alert("Quantity must be a non-negative number.");
            return;
        }

        if (currentEditProduct) { // Editing existing product
            const index = inventoryData.findIndex(p => p.id === product.id);
            if (index > -1) {
                inventoryData[index] = product;
            }
        } else { // Adding new product
            inventoryData.push(product);
        }
        setUnsavedChanges(true);
        renderTable();
        closeModal();
    }

    function addProduct() {
        openModal('Add New Product');
    }

    function openEditModal(product = null) {
        const productToEdit = product || inventoryData.find(p => p.id === selectedProductId);
        if (productToEdit) {
            openModal('Edit Product', productToEdit);
        } else {
            alert("Please select a product to edit.");
        }
    }

    function deleteProduct() {
        if (!selectedProductId) {
            alert("Please select a product to delete.");
            return;
        }
        const productToDelete = inventoryData.find(p => p.id === selectedProductId);
        if (confirm(`Are you sure you want to delete "${productToDelete.productName}"?`)) {
            inventoryData = inventoryData.filter(p => p.id !== selectedProductId);
            selectedProductId = null; // Deselect
            setUnsavedChanges(true);
            renderTable();
        }
    }

    // --- Search ---
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = searchCategorySelect.value; // This will be productName, locationCode, etc.

        if (!searchTerm) {
            renderTable();
            return;
        }

        const filterFn = (product) => {
            const checkValue = (value) => value && String(value).toLowerCase().includes(searchTerm);

            if (category === 'all') {
                return checkValue(product.productName) ||
                       checkValue(product.locationCode) ||
                       checkValue(product.brand) ||
                       checkValue(product.features) ||
                       checkValue(product.hashtags) ||
                       checkValue(product.condition);
            } else if (category === 'quantity') { // Not in select, but as an example
                 return product.quantity !== undefined && String(product.quantity).includes(searchTerm);
            }
            // For specific category search, use bracket notation
            return checkValue(product[category]);
        };
        renderTable(filterFn);
    }

    // --- Event Listeners ---
    addButton.addEventListener('click', addProduct);
    editButton.addEventListener('click', () => openEditModal());
    deleteButton.addEventListener('click', deleteProduct);

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    resetSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        searchCategorySelect.value = 'all';
        renderTable();
    });

    // Modal events
    closeButton.addEventListener('click', closeModal);
    cancelModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    productForm.addEventListener('submit', handleFormSubmit);

    // Warn on unsaved changes when leaving the page
    window.addEventListener('beforeunload', (event) => {
        if (unsavedChanges) {
            event.preventDefault(); // Standard in many browsers
            event.returnValue = ''; // For older browsers / Chrome
            return "There are unsaved changes. Are you sure you want to leave?";
        }
    });

    // Initial rendering (table will be empty until data is loaded)
    renderTable();
    lastLoadedFileDisplay.textContent = "No file loaded yet. Please select 'inventory_data.json'.";
});