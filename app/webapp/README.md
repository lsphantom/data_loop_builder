# Data Loop Builder Web Application

A modern web-based version of the Data Loop Builder that allows users to create interactive image loops through a drag-and-drop interface.

## Features

- **Drag & Drop Interface**: Simply drag folders containing images onto the web app
- **Real-time Processing**: Watch as your image sequences are processed
- **Batch Processing**: Handle multiple folders at once
- **Live Preview**: Preview your loops before downloading
- **Configurable Settings**: Customize loop behavior and controls
- **Download Options**: Download individual loops or all loops as a ZIP file

## How to Use

1. **Open the Web App**: Open `index.html` in your web browser
2. **Select Images**: 
   - Drag and drop folders containing image sequences onto the drop zone, OR
   - Click "Select Folders" to choose directories
3. **Configure Settings**: Adjust loop settings in the right panel:
   - Choose image file types to include
   - Set files to exclude
   - Configure loop controls and behavior
4. **Generate Loops**: Click "Generate Image Loops" to process your images
5. **Download Results**: 
   - Preview individual loops
   - Download single loop files
   - Download all loops as a ZIP file

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- WebP

## Browser Requirements

- Modern web browser with support for:
  - File API
  - Drag and Drop API
  - ES6+ JavaScript features
- Recommended browsers:
  - Chrome 80+
  - Firefox 75+
  - Safari 13+
  - Edge 80+

## File Structure

```
webapp/
├── index.html              # Main application interface
├── css/
│   ├── app.css            # Application styles
│   ├── bootstrap.min.css  # Bootstrap framework
│   └── looper.css         # Original looper styles
├── js/
│   ├── app.js             # Main application logic
│   ├── imageProcessor.js  # Image handling module
│   ├── htmlGenerator.js   # HTML generation module
│   ├── looper.js          # Original looper functionality
│   ├── jquery.min.js      # jQuery library
│   ├── bootstrap.min.js   # Bootstrap JavaScript
│   └── jszip.min.js       # ZIP file creation
├── assets/
│   ├── bootstrap/         # Bootstrap assets
│   └── controls/          # Control icons
└── templates/
    └── looper-template.html # HTML template for generated loops
```

## Generated Loop Features

Each generated HTML file includes:

- **Interactive Controls**:
  - Play/Pause button
  - Next/Previous frame navigation
  - Speed controls (faster/slower)
  - Reset to beginning
  - Frame counter

- **Responsive Design**: Loops adapt to different screen sizes
- **Self-contained**: Each HTML file contains all necessary code and images
- **Professional Styling**: Clean, modern interface

## Keyboard Shortcuts (in generated loops)

- `Space`: Play/Pause
- `Arrow Left`: Previous frame
- `Arrow Right`: Next frame
- `Home`: Reset to beginning
- `+`: Increase speed
- `-`: Decrease speed

## Troubleshooting

### Common Issues

1. **"No images found"**: Ensure your folders contain supported image formats
2. **Slow processing**: Large images may take time to process - consider optimizing images for web
3. **Browser memory issues**: Very large image sets may cause performance issues
4. **Download not working**: Ensure your browser allows downloads and popups

### Performance Tips

- Optimize images before processing (recommended max size: 1920x1080)
- Process folders with 50 or fewer images for best performance
- Use consistent image formats within each folder
- Close other browser tabs to free up memory

## Development

This web application is built with:

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: jQuery, Bootstrap 3, JSZip
- **Architecture**: Modular JavaScript with separate concerns

## License

Same as the main Data Loop Builder project.