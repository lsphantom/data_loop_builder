/**
 * Image Processor Module
 * Handles image file detection, filtering, and metadata extraction
 */

class ImageProcessor {
    static async processFolder(folder, config) {
        const imageFiles = folder.files.filter(file => 
            this.isValidImageFile(file, config)
        );

        if (imageFiles.length === 0) {
            throw new Error(`No valid image files found in folder: ${folder.name}`);
        }

        // Sort images by filename for consistent ordering
        imageFiles.sort((a, b) => {
            const aName = this.getFileName(a);
            const bName = this.getFileName(b);
            return aName.localeCompare(bName, undefined, { numeric: true });
        });

        // Process each image and create data URLs
        const processedImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const processedImage = await this.processImage(file, i + 1);
            processedImages.push(processedImage);
        }

        // Get dimensions from the first image for responsive layout
        const firstImage = processedImages[0];
        const dimensions = await this.getImageDimensions(firstImage.dataUrl);
        
        return {
            images: processedImages,
            totalCount: processedImages.length,
            dimensions: dimensions,
            folderName: folder.name
        };
    }

    static isValidImageFile(file, config) {
        const fileName = this.getFileName(file);
        const extension = this.getFileExtension(fileName);
        
        // Check if file extension is allowed
        if (!config.imageTypes.includes(extension)) {
            return false;
        }

        // Check if file is in exclude list
        if (config.excludeFiles.some(excludeName => 
            fileName.toLowerCase().includes(excludeName.toLowerCase())
        )) {
            return false;
        }

        return true;
    }

    static getFileName(file) {
        // Handle both regular files and files with webkitRelativePath
        if (file.webkitRelativePath) {
            const pathParts = file.webkitRelativePath.split('/');
            return pathParts[pathParts.length - 1];
        }
        return file.name;
    }

    static getFileExtension(fileName) {
        const extension = fileName.toLowerCase().split('.').pop();
        // Normalize jpeg to jpg
        return extension === 'jpeg' ? 'jpg' : extension;
    }

    static async processImage(file, index) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                
                resolve({
                    id: index,
                    name: ImageProcessor.getFileName(file),
                    dataUrl: dataUrl,
                    size: file.size,
                    type: file.type,
                    alt: `Image ${index}`
                });
            };
            
            reader.onerror = function() {
                reject(new Error(`Failed to read image: ${ImageProcessor.getFileName(file)}`));
            };
            
            reader.readAsDataURL(file);
        });
    }

    static getImageDimensions(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = function() {
                resolve({
                    width: this.width,
                    height: this.height,
                    aspectRatio: this.width / this.height
                });
            };
            
            img.onerror = function() {
                // Fallback dimensions if image can't be loaded
                resolve({
                    width: 800,
                    height: 600,
                    aspectRatio: 4/3
                });
            };
            
            img.src = dataUrl;
        });
    }

    static generateImageMetadata(processedImages) {
        const metadata = {
            totalImages: processedImages.length,
            totalSize: processedImages.reduce((sum, img) => sum + img.size, 0),
            imageTypes: [...new Set(processedImages.map(img => img.type))],
            fileNames: processedImages.map(img => img.name)
        };

        return metadata;
    }

    static validateImageSequence(processedImages) {
        const validation = {
            isValid: true,
            warnings: [],
            errors: []
        };

        // Check if we have at least 2 images for a meaningful loop
        if (processedImages.length < 2) {
            validation.warnings.push('Only one image found - loop will be static');
        }

        // Check for very large file sizes that might cause browser issues
        const largeMB = 5 * 1024 * 1024; // 5MB
        const largeImages = processedImages.filter(img => img.size > largeMB);
        if (largeImages.length > 0) {
            validation.warnings.push(`${largeImages.length} large images detected (>5MB) - may cause performance issues`);
        }

        // Check total memory usage
        const totalSize = processedImages.reduce((sum, img) => sum + img.size, 0);
        const maxRecommendedSize = 50 * 1024 * 1024; // 50MB
        if (totalSize > maxRecommendedSize) {
            validation.warnings.push('Total image size is large - consider optimizing images for web use');
        }

        // Check for inconsistent image types
        const imageTypes = [...new Set(processedImages.map(img => img.type))];
        if (imageTypes.length > 1) {
            validation.warnings.push('Mixed image formats detected - consider using consistent format for best compatibility');
        }

        return validation;
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static createThumbnail(dataUrl, maxWidth = 150, maxHeight = 150) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // Calculate thumbnail dimensions maintaining aspect ratio
                let { width, height } = this;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(this, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            
            img.onerror = function() {
                resolve(dataUrl); // Return original if thumbnail creation fails
            };
            
            img.src = dataUrl;
        });
    }
}

// Export for use in other modules
window.ImageProcessor = ImageProcessor;