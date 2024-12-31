// Get elements
const fileElem = document.getElementById('fileElem');
const imagesContainer = document.getElementById('images-container');
const compressionLevelInput = document.getElementById('compression-level');
const compressionValueSpan = document.getElementById('compression-value');
const downloadAllButton = document.getElementById('download-all');
const downloadZipButton = document.getElementById('download-zip');

let originalImages = []; // Store original image Blobs
let compressedImageSizes = {}; // Store estimated sizes for each image at different levels

// Prevent default drag behaviors for the entire document
document.addEventListener('dragenter', preventDefaults, false);
document.addEventListener('dragover', preventDefaults, false);
document.addEventListener('dragleave', preventDefaults, false);
document.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight the body when an item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    document.body.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    document.body.classList.add('dragover');
}

function unhighlight(e) {
    document.body.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles(files);
}

// Handle file selection via input
fileElem.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    ([...files]).forEach(uploadFile);
}

async function uploadFile(file) {
    if (!file.type.startsWith('image/')) {
        alert("Please upload image files only.");
        return;
    }

    originalImages.push({
        filename: file.name,
        blob: file
    });

    displayImagePreview(file);
    await calculateAndDisplaySizes(file.name);
}

function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageItem = document.createElement('div');
        imageItem.classList.add('image-item');
        imageItem.dataset.originalName = file.name;

        const img = document.createElement('img');
        img.src = e.target.result;
        imageItem.appendChild(img);

        const sizePreview = document.createElement('span');
        sizePreview.classList.add('size-preview');
        imageItem.appendChild(sizePreview);

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.addEventListener('click', () => downloadCompressedImage(file.name));
        imageItem.appendChild(downloadButton);

        imagesContainer.appendChild(imageItem);
    }
    reader.readAsDataURL(file);
}

async function calculateAndDisplaySizes(originalName) {
    const originalImage = originalImages.find(img => img.filename === originalName);
    if (!originalImage) return;

    compressedImageSizes[originalName] = {}; // Initialize sizes for this image

    for (let level = 0; level <= 100; level += 10) { // Check every 10% for preview
        const quality = level / 100;
        const compressedBlob = await compressImageBlob(originalImage.blob, quality);
        compressedImageSizes[originalName][level] = compressedBlob.size;
        updateSizePreview(originalName, parseInt(compressionLevelInput.value));
    }
}

function compressImageBlob(blob, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function() {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            }
            img.src = reader.result;
        };
        reader.readAsDataURL(blob);
    });
}

function updateSizePreview(originalName, currentLevel) {
    const imageItem = document.querySelector(`.image-item[data-original-name="${originalName}"]`);
    if (imageItem && compressedImageSizes[originalName]) {
        let bestLevel = 0;
        for (const level in compressedImageSizes[originalName]) {
            if (parseInt(level) <= currentLevel) {
                bestLevel = parseInt(level);
            }
        }
        const sizeInKB = (compressedImageSizes[originalName][bestLevel] / 1024).toFixed(2);
        const sizePreview = imageItem.querySelector('.size-preview');
        if (sizePreview) {
            sizePreview.textContent = `Estimated Size: ${sizeInKB} KB`;
        }
    }
}

async function downloadCompressedImage(originalName) {
    const compressionLevel = parseInt(compressionLevelInput.value) / 100;
    const originalImage = originalImages.find(img => img.filename === originalName);
    if (!originalImage) return;

    const compressedBlob = await compressImageBlob(originalImage.blob, compressionLevel);
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalName.split('.').slice(0, -1).join('.') + `_compressed_${parseInt(compressionLevel * 100)}%.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Update compression value display and update size previews
compressionLevelInput.addEventListener('input', function() {
    compressionValueSpan.textContent = this.value + '%';
    const currentLevel = parseInt(this.value);
    originalImages.forEach(img => {
        updateSizePreview(img.filename, currentLevel);
    });
});

// Download all images as separate files
downloadAllButton.addEventListener('click', async () => {
    const compressionLevel = parseInt(compressionLevelInput.value) / 100;
    for (const originalImage of originalImages) {
        const compressedBlob = await compressImageBlob(originalImage.blob, compressionLevel);
        const url = URL.createObjectURL(compressedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalImage.filename.split('.').slice(0, -1).join('.') + `_compressed_${parseInt(compressionLevel * 100)}%.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
});

// Download all images as a zip file
downloadZipButton.addEventListener('click', async () => {
    const compressionLevel = parseInt(compressionLevelInput.value) / 100;
    if (originalImages.length === 0) {
        alert("No images to zip.");
        return;
    }

    const zip = new JSZip();

    for (const originalImage of originalImages) {
        const compressedBlob = await compressImageBlob(originalImage.blob, compressionLevel);
        zip.file(originalImage.filename.split('.').slice(0, -1).join('.') + `_compressed_${parseInt(compressionLevel * 100)}%.jpg`, compressedBlob);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `compressed_images_${parseInt(compressionLevel * 100)}%.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});