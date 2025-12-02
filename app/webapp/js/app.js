/**
 * Data Loop Builder Web App
 * Main application logic
 */

class LoopBuilderApp {
    constructor() {
        this.selectedFolders = new Map();
        this.processedResults = [];
        this.config = {
            imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Accept all supported types
            excludeFiles: ['CONUS.jpg', 'Texas.jpg', 'NH.jpg'],
            autoplay: true,
            showNavigation: true,     // Always enabled
            showCounter: true,        // Always enabled  
            showSpeedControls: true,  // Always enabled
            showStepControls: true    // Always enabled
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateConfig();
        this.checkBrowserSupport();
        this.showToast('Welcome to Data Loop Builder!', 'info');
    }

    checkBrowserSupport() {
        // Check if the browser supports directory upload
        const input = document.createElement('input');
        input.type = 'file';
        
        if (!('webkitdirectory' in input)) {
            this.showToast('Your browser may have limited folder support. Drag & drop is recommended.', 'warning');
            $('#selectFolderBtn').prop('disabled', true).text('Drag & Drop Only');
        }
    }

    bindEvents() {
        // Folder selection events
        $('#selectFolderBtn').on('click', (e) => {
            e.preventDefault();
            this.selectFolders();
        });
        $('#folderInput').on('change', (e) => this.handleFolderSelection(e));
        
        // Drag and drop events
        const dropZone = $('#dropZone')[0];
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        
        // Configuration events
        $('#configForm input').on('change', () => this.updateConfig());
        
        // Action buttons
        $('#generateBtn').on('click', () => this.generateLoops());
        $('#downloadAllBtn').on('click', () => this.downloadAll());
        $('#resetBtn').on('click', () => this.reset());
        
        // Click on drop zone to also trigger folder selection
        $('#dropZone').on('click', (e) => {
            if (e.target === dropZone || $(e.target).closest('.drop-zone-content').length) {
                this.selectFolders();
            }
        });
    }

    selectFolders() {
        const folderInput = document.getElementById('folderInput');
        if (folderInput) {
            folderInput.click();
        }
    }

    handleFolderSelection(event) {
        console.log('Folder selection triggered', event);
        const files = Array.from(event.target.files);
        console.log('Selected files:', files.length);
        
        if (files.length === 0) {
            this.showToast('No folders selected', 'warning');
            return;
        }
        
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        $('#dropZone').addClass('dragover');
    }

    handleDragEnter(event) {
        event.preventDefault();
        $('#dropZone').addClass('dragover');
    }

    handleDragLeave(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            $('#dropZone').removeClass('dragover');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        $('#dropZone').removeClass('dragover');
        
        const items = Array.from(event.dataTransfer.items);
        this.processDroppedItems(items);
    }

    async processDroppedItems(items) {
        const files = [];
        
        for (const item of items) {
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry && entry.isDirectory) {
                    const dirFiles = await this.readDirectory(entry);
                    files.push(...dirFiles);
                }
            }
        }
        
        this.processFiles(files);
    }

    readDirectory(dirEntry) {
        return new Promise((resolve) => {
            const files = [];
            const reader = dirEntry.createReader();
            
            const readEntries = () => {
                reader.readEntries((entries) => {
                    if (entries.length) {
                        for (const entry of entries) {
                            if (entry.isFile) {
                                entry.file((file) => {
                                    file.relativePath = entry.fullPath;
                                    files.push(file);
                                });
                            }
                        }
                        readEntries(); // Continue reading
                    } else {
                        resolve(files);
                    }
                });
            };
            
            readEntries();
        });
    }

    processFiles(files) {
        const folderMap = new Map();
        
        // Group files by directory
        files.forEach(file => {
            const path = file.webkitRelativePath || file.relativePath || file.name;
            const pathParts = path.split('/');
            
            if (pathParts.length > 1) {
                const folderName = pathParts[0];
                if (!folderMap.has(folderName)) {
                    folderMap.set(folderName, []);
                }
                folderMap.get(folderName).push(file);
            }
        });

        // Add to selected folders
        folderMap.forEach((files, folderName) => {
            const imageFiles = files.filter(file => this.isImageFile(file.name));
            if (imageFiles.length > 0) {
                this.selectedFolders.set(folderName, {
                    name: folderName,
                    files: imageFiles,
                    imageCount: imageFiles.length
                });
            }
        });

        this.updateFolderList();
        this.updateGenerateButton();
    }

    isImageFile(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        return this.config.imageTypes.includes(ext);
    }

    updateFolderList() {
        const foldersList = $('#foldersList');
        const selectedFoldersSection = $('#selectedFolders');
        
        if (this.selectedFolders.size === 0) {
            selectedFoldersSection.hide();
            return;
        }

        selectedFoldersSection.show();
        foldersList.empty();

        this.selectedFolders.forEach((folder, folderName) => {
            const folderItem = $(`
                <div class="folder-item" data-folder="${folderName}">
                    <div>
                        <div class="folder-name">
                            <span class="glyphicon glyphicon-folder-open mr-2"></span>
                            ${folder.name}
                        </div>
                        <div class="folder-info">
                            ${folder.imageCount} images found
                        </div>
                    </div>
                    <span class="folder-remove glyphicon glyphicon-remove" data-folder="${folderName}"></span>
                </div>
            `);
            
            foldersList.append(folderItem);
        });

        // Bind remove events
        $('.folder-remove').on('click', (e) => {
            const folderName = $(e.target).data('folder');
            this.removeFolder(folderName);
        });
    }

    removeFolder(folderName) {
        this.selectedFolders.delete(folderName);
        this.updateFolderList();
        this.updateGenerateButton();
    }

    updateConfig() {
        // Image types are now fixed to support all formats
        this.config.imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        // Exclude files
        const excludeText = $('#excludeFiles').val();
        this.config.excludeFiles = excludeText
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Loop settings - only autoplay is configurable now
        this.config.autoplay = $('#autoplay').is(':checked');
        
        // Navigation controls are always enabled
        this.config.showNavigation = true;
        this.config.showCounter = true;
        this.config.showSpeedControls = true;
        this.config.showStepControls = true;
    }

    updateGenerateButton() {
        const hasfolders = this.selectedFolders.size > 0;
        $('#generateBtn').prop('disabled', !hasfolders);
    }

    async generateLoops() {
        if (this.selectedFolders.size === 0) {
            this.showToast('Please select folders first', 'warning');
            return;
        }

        this.updateConfig();
        this.showProcessingSection();
        this.processedResults = [];

        const folders = Array.from(this.selectedFolders.values());
        let processed = 0;
        const total = folders.length;

        for (const folder of folders) {
            try {
                this.updateProgress(processed, total, `Processing ${folder.name}...`);
                this.addLogEntry(`Processing folder: ${folder.name}`, 'info');

                const processedImages = await ImageProcessor.processFolder(folder, this.config);
                const folderStructure = await HTMLGenerator.generateLoop(folder.name, processedImages, this.config);
                
                this.processedResults.push({
                    name: folder.name,
                    folderStructure: folderStructure,
                    imageCount: processedImages.images.length,
                    hasOverlay: processedImages.hasOverlay,
                    overlayFilename: processedImages.overlay ? HTMLGenerator.sanitizeFilename(processedImages.overlay.name) : null
                });

                this.addLogEntry(`✓ Generated loop for ${folder.name} (${processedImages.images.length} images)`, 'success');
                processed++;
                this.updateProgress(processed, total);

            } catch (error) {
                this.addLogEntry(`✗ Error processing ${folder.name}: ${error.message}`, 'error');
                console.error('Processing error:', error);
                processed++;
                this.updateProgress(processed, total);
            }
        }

        this.updateProgress(total, total, 'Processing complete!');
        this.showResultsSection();
        this.showToast(`Successfully generated ${this.processedResults.length} loops!`, 'success');
    }

    showProcessingSection() {
        $('#processingSection').show();
        $('#resultsSection').hide();
        $('#progressBar').css('width', '0%');
        $('#progressText').text('0%');
        $('#currentTask').text('Initializing...');
        $('#processingLog').empty();
    }

    updateProgress(current, total, task = '') {
        const percentage = Math.round((current / total) * 100);
        $('#progressBar').css('width', `${percentage}%`).attr('aria-valuenow', percentage);
        $('#progressText').text(`${percentage}%`);
        
        if (task) {
            $('#currentTask').text(task);
        }
    }

    addLogEntry(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = $(`
            <div class="log-entry ${type}">
                [${timestamp}] ${message}
            </div>
        `);
        
        const log = $('#processingLog');
        log.append(logEntry);
        log.scrollTop(log[0].scrollHeight);
    }

    showResultsSection() {
        $('#resultsSection').show();
        this.updateResultsList();
    }

    updateResultsList() {
        const resultsList = $('#resultsList');
        resultsList.empty();

        this.processedResults.forEach((result, index) => {
            const overlayInfo = result.hasOverlay ? ' • <span class="text-success">Overlay detected</span>' : '';
            const resultItem = $(`
                <div class="result-item">
                    <div class="result-info">
                        <div class="result-name">
                            <span class="glyphicon glyphicon-film mr-2"></span>
                            ${result.name}
                        </div>
                        <div class="result-details">
                            ${result.imageCount} images • HTML folder with external files${overlayInfo}
                        </div>
                    </div>
                    <div class="result-actions">
                        <button type="button" class="btn btn-primary btn-sm preview-btn" data-index="${index}">
                            <span class="glyphicon glyphicon-eye-open mr-1"></span>
                            Preview
                        </button>
                        <button type="button" class="btn btn-success btn-sm download-btn" data-index="${index}">
                            <span class="glyphicon glyphicon-download mr-1"></span>
                            Download Folder
                        </button>
                    </div>
                </div>
            `);
            
            resultsList.append(resultItem);
        });

        // Bind action events
        $('.preview-btn').on('click', (e) => {
            const index = $(e.target).closest('.preview-btn').data('index');
            this.previewLoop(index);
        });

        $('.download-btn').on('click', (e) => {
            const index = $(e.target).closest('.download-btn').data('index');
            this.downloadSingle(index);
        });
    }

    previewLoop(index) {
        const result = this.processedResults[index];
        
        // Generate a self-contained HTML for preview (with embedded assets)
        const previewHtml = this.generatePreviewHTML(result);
        
        // Show in popup window
        const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
    }

    generatePreviewHTML(result) {
        const { folderStructure } = result;
        const config = this.getConfigFromResult(result);
        
        // Get the CSS and JS content
        const cssContent = folderStructure.files['src'].files['styles.css'].content;
        const jsContent = folderStructure.files['src'].files['looper.js'].content;
        const jqueryContent = folderStructure.files['src'].files['jquery.min.js'].content;
        
        // Get image data - exclude overlay file if present
        const images = [];
        const overlayFilename = result.overlayFilename;
        
        Object.keys(folderStructure.files).forEach(key => {
            const file = folderStructure.files[key];
            if (file.type && file.type.startsWith('image/') && !key.startsWith('src/') && key !== overlayFilename) {
                images.push({
                    src: file.content, // data URL
                    name: key,
                    originalName: file.originalName
                });
            }
        });
        
        // Generate images HTML
        const imageElements = images.map(img => 
            `        <img src="${img.src}" alt="${img.name}" class="img-responsive">`
        ).join('\n');
        
        // Generate overlay if present
        let overlayHTML = '';
        let overlayToggleHTML = '';
        let overlayFile = null;
        
        if (result.hasOverlay && result.overlayFilename && folderStructure.files[result.overlayFilename]) {
            overlayFile = folderStructure.files[result.overlayFilename];
            overlayHTML = `
                        <img id="overlayImage" src="${overlayFile.content}" alt="Overlay" class="overlay-image" style="display: none;">`;
            
            overlayToggleHTML = `
                        <div class="overlay-controls">
                            <button type="button" id="overlayToggle" class="overlay-toggle" title="Toggle Overlay">
                                <span class="glyphicon glyphicon-eye-close"></span>
                                <span class="overlay-label">Show</span>
                            </button>
                        </div>`;
        }
        
        // Create self-contained HTML
        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${result.name} - Preview</title>
    <style>
${cssContent}
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="loop-content">
            <div id="preload-wrapper">
                <div class="looper-wrap">
                    <div class="looper-container">
                        <div class="looper">
${imageElements}
                        </div>${overlayHTML}${overlayToggleHTML}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
${jqueryContent}
    </script>
    <script>
${jsContent}
    </script>
    <script>
        $(document).ready(function() { 
            $(".looper").looper(${this.generateLooperConfig(config)});${overlayFile ? `
            
            // Overlay toggle functionality
            $('#overlayToggle').on('click', function() {
                const overlay = $('#overlayImage');
                const button = $(this);
                const label = button.find('.overlay-label');
                const icon = button.find('.glyphicon');
                
                if (overlay.is(':visible')) {
                    overlay.hide();
                    label.text('Show');
                    icon.removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
                    button.removeClass('active');
                } else {
                    overlay.show();
                    label.text('Hide');
                    icon.removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
                    button.addClass('active');
                }
            });` : ''}
        });
    </script>
</body>
</html>`;
    }

    getConfigFromResult(result) {
        // Get current configuration from the form
        return {
            showNavigation: true,     // Always enabled
            showCounter: true,        // Always enabled
            showSpeedControls: true,  // Always enabled
            showStepControls: true,   // Always enabled
            autoplay: $('#autoplay').is(':checked')
        };
    }

    generateLooperConfig(config) {
        return JSON.stringify({
            navigation: config.showNavigation,
            slide_captions: false,
            slide_counter: config.showCounter,
            speed_controls: config.showSpeedControls,
            forward_backward: config.showStepControls,
            autoplay: config.autoplay
        }, null, 2);
    }

    async downloadSingle(index) {
        const result = this.processedResults[index];
        await this.downloadFolderStructure(result.folderStructure, result.name);
        this.showToast(`Downloaded ${result.name} folder`, 'success');
    }

    async downloadFolderStructure(folderStructure, zipName) {
        const zip = new JSZip();
        
        // Add all files from the folder structure to the ZIP
        this.addFolderToZip(zip, folderStructure);
        
        // Generate and download the ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${zipName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    addFolderToZip(zip, folderStructure, basePath = '') {
        Object.entries(folderStructure.files).forEach(([filename, fileData]) => {
            const fullPath = basePath ? `${basePath}/${filename}` : filename;
            
            if (fileData.type === 'folder') {
                // Recursively add folder contents
                this.addFolderToZip(zip, fileData, fullPath);
            } else {
                // Add file to ZIP
                if (fileData.content.startsWith('data:')) {
                    // Handle data URLs (images)
                    const base64Data = fileData.content.split(',')[1];
                    zip.file(fullPath, base64Data, { base64: true });
                } else {
                    // Handle text files
                    zip.file(fullPath, fileData.content);
                }
            }
        });
    }

    async downloadAll() {
        if (this.processedResults.length === 0) {
            this.showToast('No results to download', 'warning');
            return;
        }

        try {
            const zip = new JSZip();
            
            // Add each result folder to the ZIP
            this.processedResults.forEach(result => {
                const folderPath = result.name;
                this.addFolderToZip(zip, result.folderStructure, folderPath);
            });

            // Generate ZIP file
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Download ZIP
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'data_loops.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showToast(`Downloaded ${this.processedResults.length} loop folders as ZIP file`, 'success');
            
        } catch (error) {
            this.showToast('Error creating ZIP file: ' + error.message, 'error');
            console.error('ZIP creation error:', error);
        }
    }

    reset() {
        this.selectedFolders.clear();
        this.processedResults = [];
        
        $('#selectedFolders').hide();
        $('#processingSection').hide();
        $('#resultsSection').hide();
        $('#folderInput').val('');
        
        this.updateGenerateButton();
        this.showToast('Reset complete', 'info');
    }

    showToast(message, type = 'info') {
        const toast = $(`
            <div class="toast ${type}">
                ${message}
            </div>
        `);
        
        $('body').append(toast);
        
        // Show toast
        setTimeout(() => toast.addClass('show'), 100);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.removeClass('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when document is ready
$(document).ready(() => {
    window.loopBuilderApp = new LoopBuilderApp();
});