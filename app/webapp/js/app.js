/**
 * Data Loop Builder Web App
 * Main application logic
 */

class LoopBuilderApp {
    constructor() {
        this.selectedFolders = new Map();
        this.processedResults = [];
        this.config = {
            imageTypes: ['jpg', 'jpeg', 'png', 'gif'],
            excludeFiles: ['CONUS.jpg', 'Texas.jpg', 'NH.jpg'],
            autoplay: true,
            showNavigation: true,
            showCounter: true,
            showSpeedControls: true,
            showStepControls: true
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateConfig();
        this.showToast('Welcome to Data Loop Builder!', 'info');
    }

    bindEvents() {
        // Folder selection events
        $('#selectFolderBtn').on('click', () => this.selectFolders());
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
        
        // Click on drop zone
        $('#dropZone').on('click', () => this.selectFolders());
    }

    selectFolders() {
        $('#folderInput').click();
    }

    handleFolderSelection(event) {
        const files = Array.from(event.target.files);
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
        // Image types
        const selectedTypes = [];
        $('#imageTypes input:checked').each(function() {
            selectedTypes.push($(this).val());
        });
        this.config.imageTypes = selectedTypes;

        // Exclude files
        const excludeText = $('#excludeFiles').val();
        this.config.excludeFiles = excludeText
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Loop settings
        this.config.autoplay = $('#autoplay').is(':checked');
        this.config.showNavigation = $('#showNavigation').is(':checked');
        this.config.showCounter = $('#showCounter').is(':checked');
        this.config.showSpeedControls = $('#showSpeedControls').is(':checked');
        this.config.showStepControls = $('#showStepControls').is(':checked');
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
                const html = await HTMLGenerator.generateLoop(folder.name, processedImages, this.config);
                
                this.processedResults.push({
                    name: folder.name,
                    html: html,
                    imageCount: processedImages.length
                });

                this.addLogEntry(`✓ Generated loop for ${folder.name} (${processedImages.length} images)`, 'success');
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
            const resultItem = $(`
                <div class="result-item">
                    <div class="result-info">
                        <div class="result-name">
                            <span class="glyphicon glyphicon-film mr-2"></span>
                            ${result.name}
                        </div>
                        <div class="result-details">
                            ${result.imageCount} images • HTML loop ready
                        </div>
                    </div>
                    <div class="result-actions">
                        <button type="button" class="btn btn-primary btn-sm preview-btn" data-index="${index}">
                            <span class="glyphicon glyphicon-eye-open mr-1"></span>
                            Preview
                        </button>
                        <button type="button" class="btn btn-success btn-sm download-btn" data-index="${index}">
                            <span class="glyphicon glyphicon-download mr-1"></span>
                            Download
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
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(result.html);
        previewWindow.document.close();
    }

    downloadSingle(index) {
        const result = this.processedResults[index];
        const blob = new Blob([result.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${result.name}_loop.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast(`Downloaded ${result.name}_loop.html`, 'success');
    }

    async downloadAll() {
        if (this.processedResults.length === 0) {
            this.showToast('No results to download', 'warning');
            return;
        }

        try {
            const zip = new JSZip();
            
            // Add each result to the ZIP
            this.processedResults.forEach(result => {
                zip.file(`${result.name}_loop.html`, result.html);
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
            
            this.showToast(`Downloaded ${this.processedResults.length} loops as ZIP file`, 'success');
            
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