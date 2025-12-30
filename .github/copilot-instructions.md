# Data Loop Builder - AI Agent Instructions

## Project Architecture

**Data Loop Builder** is a multi-version image sequence processing tool that creates interactive HTML loops from scientific data and imagery. The project serves three distinct implementations:

- **`app/webapp/`**: Modern browser-based app (primary implementation) - drag/drop folders → interactive HTML loops  
- **`app/cshell/`**: Legacy tcsh script using ImageMagick for batch processing
- **`app/desktop/`**: Planned Electron desktop application

## Core Data Flow (webapp)

1. **File ingestion**: Drag/drop directories → `app.js` processes File API objects
2. **Image analysis**: `imageProcessor.js` separates loop images from overlays using smart detection
3. **HTML generation**: `htmlGenerator.js` creates complete folder structures with embedded assets
4. **Interactive loops**: Generated HTML uses `looper.js` jQuery plugin for playback controls

### Key Processing Patterns

**Overlay detection logic** (`imageProcessor.js`):
```javascript
// Single PNG + multiple other formats = PNG becomes overlay
if (pngImages.length === 1 && (jpgImages.length > 1 || gifImages.length > 1)) {
    overlayImage = pngImages[0];
    loopImages = [...jpgImages, ...gifImages, ...webpImages];
}
```

**Exclusion filters**: Files matching `['CONUS.jpg', 'Texas.jpg', 'NH.jpg']` are automatically excluded from processing. This pattern is specific to meteorological/geographic data workflows.

## Development Workflow

### Local Development
```bash
cd app/webapp && python3 -m http.server 8080
# Navigate to http://localhost:8080
```

### Testing
- Use `test_data/sequence1/` (PNG frames) and `test_data/sequence2/` (JPG sequence)
- Test exclusion filters with included `CONUS.jpg` files
- Verify drag/drop, batch processing, and ZIP download functionality

### Deployment
- **AWS Amplify**: Static hosting via `amplify.yml` config (serves `app/webapp/` directory)
- **No build process**: Pure client-side JavaScript with CDN dependencies (Tailwind, jQuery)

## Code Conventions

### Module Organization
- **Class-based architecture**: `LoopBuilderApp`, `ImageProcessor`, `HTMLGenerator` as separate concerns
- **Configuration objects**: Centralized config in `app.js` with form binding for user preferences
- **Error boundaries**: Extensive try/catch with user-friendly toast notifications

### File Handling Patterns
```javascript
// Always check browser support for directory uploads
if (!('webkitdirectory' in input)) {
    // Fallback to drag/drop only
}

// Consistent filename sanitization for cross-platform compatibility  
sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
}
```

### HTML Generation Strategy
Generated loops create **complete folder structures** (not single files):
```
generated_folder/
├── index.htm           # Main HTML with external references
├── src/
│   ├── jquery.min.js   # Embedded jQuery
│   ├── looper.js       # Animation controller
│   └── styles.css      # Responsive CSS
└── [image files]       # Original filenames preserved
```

## Legacy Integration

**cshell version** uses different conventions:
- Processes directory trees recursively via tcsh loops
- Requires ImageMagick system dependency 
- Fixed exclusion patterns: `grep -v "CONUS.jpg" | grep -v "Texas.jpg" | grep -v "NH.jpg"`
- Generates single HTML files (not folder structures)

## External Dependencies

- **jQuery**: Used for DOM manipulation and the core `looper()` plugin
- **Tailwind CSS**: CDN-based styling (customized font scales in `index.html`)
- **Bootstrap**: Legacy CSS classes for responsive grid (`bootstrap.min.css`)
- **JSZip**: Client-side ZIP creation for batch downloads

## Scientific Data Context

This tool specializes in **meteorological and scientific imagery**:
- Time-series weather radar data
- Satellite imagery sequences  
- Scientific data visualization loops
- Built for **UCAR/COMET Program** workflows

When modifying image processing logic, consider these domain requirements for frame sequencing, overlay handling, and geographic data exclusions.