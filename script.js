// Smooth scroll to tools section
function scrollToTools() {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Converter Base Class
class FileConverter {
    constructor(config) {
        this.inputFormat = config.inputFormat;
        this.outputFormat = config.outputFormat;
        this.uploadArea = document.querySelector('.upload-area');
        this.fileInput = document.querySelector('.file-input');
        this.previewArea = document.querySelector('.preview-area');
        this.resultArea = document.querySelector('.result-area');
        this.loadingArea = document.querySelector('.loading');
        this.errorArea = document.querySelector('.error');
        this.successArea = document.querySelector('.success');
        this.qualityControl = document.querySelector('[name="quality"]');
        this.convertBtn = document.querySelector('.convert-btn');
        this.downloadBtn = document.querySelector('.download-btn');
        this.selectedFile = null;
        this.convertedData = null;

        this.init();
    }

    init() {
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('click', () => this.fileInput.click());

        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Convert button
        if (this.convertBtn) {
            this.convertBtn.addEventListener('click', () => this.convert());
        }

        // Download button
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.download());
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect({ target: { files } });
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.selectedFile = files[0];
            this.displayFileName(this.selectedFile.name);
            this.displayPreview(this.selectedFile);
        }
    }

    displayFileName(name) {
        const uploadText = this.uploadArea.querySelector('.upload-text');
        uploadText.innerHTML = `<h3>✓ File Selected</h3><p>${name}</p>`;
    }

    displayPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                this.previewArea.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            }
        };
        reader.readAsDataURL(file);
    }

    showLoading(show = true) {
        if (show) {
            this.loadingArea.classList.add('active');
            this.resultArea.classList.remove('active');
            this.errorArea.classList.remove('active');
        } else {
            this.loadingArea.classList.remove('active');
        }
    }

    showError(message) {
        this.errorArea.querySelector('p').textContent = message;
        this.errorArea.classList.add('active');
        this.resultArea.classList.remove('active');
        this.loadingArea.classList.remove('active');
    }

    showSuccess(message) {
        this.successArea.querySelector('p').textContent = message;
        this.successArea.classList.add('active');
        this.errorArea.classList.remove('active');
    }

    showResult(show = true) {
        if (show) {
            this.resultArea.classList.add('active');
            this.loadingArea.classList.remove('active');
        }
    }

    async convert() {
        if (!this.selectedFile) {
            this.showError(`Please select a ${this.inputFormat} file`);
            return;
        }

        this.showLoading(true);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                let quality = 0.9;
                if (this.qualityControl) {
                    quality = this.qualityControl.value / 100;
                }

                this.convertedData = canvas.toDataURL(`image/${this.outputFormat}`, quality);
                this.previewArea.innerHTML = `<img src="${this.convertedData}" alt="Converted">`;
                this.showLoading(false);
                this.showSuccess(`Successfully converted to ${this.outputFormat.toUpperCase()}!`);
                this.showResult(true);
            };

            img.onerror = () => {
                this.showError('Failed to load image. Please try again.');
            };

            img.src = URL.createObjectURL(this.selectedFile);
        } catch (error) {
            this.showError('Conversion failed: ' + error.message);
        }
    }

    download() {
        if (!this.convertedData) {
            this.showError('Please convert an image first');
            return;
        }

        const link = document.createElement('a');
        link.href = this.convertedData;
        link.download = `converted.${this.outputFormat}`;
        link.click();
    }
}

// Initialize converter when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Get the converter type from the page
    const pageTitle = document.querySelector('.converter-header h1');
    if (pageTitle) {
        const title = pageTitle.textContent.trim();
        
        let inputFormat, outputFormat;
        
        if (title.includes('PNG to JPG')) {
            inputFormat = 'PNG';
            outputFormat = 'jpeg';
        } else if (title.includes('JPG to PNG')) {
            inputFormat = 'JPG';
            outputFormat = 'png';
        } else if (title.includes('Resize')) {
            // Handle resize separately
            initResizer();
            return;
        } else if (title.includes('QR')) {
            // Handle QR Code separately
            initQRGenerator();
            return;
        }

        if (inputFormat && outputFormat) {
            new FileConverter({
                inputFormat: inputFormat,
                outputFormat: outputFormat
            });
        }
    }
});

// Image Resizer
function initResizer() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.querySelector('.file-input');
    const previewArea = document.querySelector('.preview-area');
    const widthInput = document.querySelector('[name="width"]');
    const heightInput = document.querySelector('[name="height"]');
    const aspectRatioBtn = document.querySelector('.toggle-aspect-ratio');
    const resultArea = document.querySelector('.result-area');
    const downloadBtn = document.querySelector('.download-btn');
    
    let selectedFile = null;
    let resizedData = null;
    let maintainAspect = true;

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        fileInput.files = e.dataTransfer.files;
        handleFileSelect();
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
        selectedFile = fileInput.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    widthInput.value = img.width;
                    heightInput.value = img.height;
                    previewArea.innerHTML = `<img src="${e.target.result}" alt="Preview" id="previewImg">`;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    document.querySelector('.resize-btn').addEventListener('click', () => {
        if (!selectedFile) {
            alert('Please select an image');
            return;
        }

        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);

        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resizedData = canvas.toDataURL('image/png');
            previewArea.innerHTML = `<img src="${resizedData}" alt="Resized">`;
            resultArea.classList.add('active');
        };
        img.src = previewArea.querySelector('img').src;
    });

    downloadBtn.addEventListener('click', () => {
        if (!resizedData) return;
        const link = document.createElement('a');
        link.href = resizedData;
        link.download = 'resized.png';
        link.click();
    });
}

// QR Code Generator
function initQRGenerator() {
    const textInput = document.querySelector('[name="qrtext"]');
    const sizeSelect = document.querySelector('[name="size"]');
    const colorInput = document.querySelector('[name="color"]');
    const bgColorInput = document.querySelector('[name="bgcolor"]');
    const generateBtn = document.querySelector('.generate-qr-btn');
    const previewArea = document.querySelector('.preview-area');
    const resultArea = document.querySelector('.result-area');
    const downloadBtn = document.querySelector('.download-btn');

    generateBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter text or URL');
            return;
        }

        const size = sizeSelect.value;
        const color = colorInput.value.replace('#', '');
        const bgColor = bgColorInput.value.replace('#', '');

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&bgcolor=${bgColor}`;

        previewArea.innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
        resultArea.classList.add('active');

        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = qrUrl;
            link.download = 'qrcode.png';
            link.click();
        };
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateBtn.click();
    });
}

// Add active class to current nav link
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
