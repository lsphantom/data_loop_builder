# Data Loop Builder
Created by Bryan Guarente (The COMET Program)

A tool for automatically generating interactive HTML image loops from directories of images. Perfect for creating animated sequences from scientific data, weather imagery, time-lapse sequences, and other image series.


## Overview

Data Loop Builder is a shell script (`loopBuilder.csh`) that processes directories containing image sequences and generates interactive HTML files with a customizable image looper interface. Each generated HTML file includes navigation controls for play/pause, speed adjustment, stepping through frames, and resetting to the beginning.

## Features

### Web Application Features
- **Drag & Drop Interface**: Simply drag folders containing images onto the web app
- **Real-time Processing**: Watch as your image sequences are processed with progress tracking
- **Batch Processing**: Handle multiple folders at once
- **Live Preview**: Preview your loops before downloading
- **Configurable Settings**: Customize loop behavior, controls, and image filtering
- **Download Options**: Download individual loops or all loops as a ZIP file
- **Modern UI**: Responsive, user-friendly interface that works on desktop and mobile

### Core Loop Features
- **Automatic HTML Generation**: Creates self-contained HTML files with embedded controls
- **Interactive Controls**: 
  - Play/Pause functionality
  - Forward/Backward stepping
  - Speed controls (faster/slower)
  - Reset to beginning
  - Frame counter display
- **Responsive Design**: Uses Bootstrap for mobile-friendly layouts
- **Cross-fade Animation**: Smooth transitions between images
- **Keyboard Shortcuts**: Accessible via keyboard controls
- **Image Format Support**: Works with various image formats (PNG, JPG, GIF, etc.)

## Requirements

- **tcsh shell**: The script is written in tcsh
- **ImageMagick**: Required for image dimension detection (`identify` command)
- **Web browser**: For viewing the generated HTML loops

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/lsphantom/data_loop_builder.git
   cd data_loop_builder
   ```

2. Make the script executable:
   ```bash
   chmod +x loopBuilder.csh
   ```

3. Ensure ImageMagick is installed:
   ```bash
   # On macOS with Homebrew
   brew install imagemagick
   
   # On Ubuntu/Debian
   sudo apt-get install imagemagick
   
   # On CentOS/RHEL
   sudo yum install ImageMagick
   ```

## Usage

### Web Application (Recommended)

The easiest way to use Data Loop Builder is through the web application:

1. **Start the Web App**:
   ```bash
   cd app/webapp
   python3 -m http.server 8080
   ```

2. **Open in Browser**: Navigate to `http://localhost:8080`

3. **Create Loops**:
   - Drag and drop folders containing image sequences onto the drop zone
   - Configure loop settings in the right panel
   - Click "Generate Image Loops"
   - Preview and download your interactive loops

### Command Line (Original Script)

### Basic Syntax

```bash
./loopBuilder.csh <path_to_parent_directory> <image_extension>
```

### Parameters

- `path_to_parent_directory`: Path to the directory containing subdirectories with image sequences
- `image_extension`: File extension of images to process (e.g., `png`, `jpg`, `gif`)

### Example

```bash
./loopBuilder.csh /path/to/weather/data png
```

This command will:
1. Look for subdirectories in `/path/to/weather/data`
2. Find all `.png` files in each subdirectory
3. Generate an `index.htm` file in each subdirectory with an interactive image loop

### Directory Structure

Your input directory should be organized like this:

```
/path/to/data/
├── sequence1/
│   ├── frame001.png
│   ├── frame002.png
│   └── frame003.png
├── sequence2/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── image003.jpg
└── sequence3/
    ├── data001.gif
    └── data002.gif
```

After running the script, each subdirectory will contain:
- `index.htm` - The interactive loop viewer
- `src/` - Directory with required CSS, JS, and assets (copied from main project)

## Controls

The generated HTML interface includes these controls:

| Control | Keyboard Shortcut | Function |
|---------|------------------|----------|
| ⏸️/▶️ | `P` | Play/Pause the animation |
| ⏹️ | `R` | Reset to first frame |
| ⏮️ | `A` | Step backward one frame |
| ⏭️ | `D` | Step forward one frame |
| ➖ | `S` | Decrease animation speed |
| ➕ | `W` | Increase animation speed |

## Configuration

The looper can be customized by modifying the JavaScript options in the generated HTML:

```javascript
$(".looper").looper({
    navigation         : true,  // Display navigation controls
    slide_captions     : false, // Display image captions
    slide_counter      : true,  // Display frame counter
    speed_controls     : true,  // Display speed controls
    forward_backward   : true,  // Display step controls
    autoplay          : true   // Auto-start the loop
});
```

## Image Filtering

The script automatically excludes certain common overview images:
- `CONUS.jpg` (Continental US overview)
- `Texas.jpg` (Texas overview)
- `NH.jpg` (New Hampshire overview)

## Technical Details

### Dependencies Included

- **jQuery**: JavaScript library for DOM manipulation
- **Bootstrap**: CSS framework for responsive design
- **Custom Looper**: JavaScript plugin for image animation
- **Glyphicons**: Icon fonts for control buttons

### Browser Compatibility

The generated HTML works in all modern browsers including:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

1. **"No image files found"**: Ensure your image files have the correct extension
2. **Script permission denied**: Run `chmod +x loopBuilder.csh`
3. **ImageMagick not found**: Install ImageMagick or ensure it's in your PATH

### Backup Behavior

The script automatically backs up existing `index.htm` files as `index_old.htm` before creating new ones.


## License

This project is open source. Please check with the repository owner for specific licensing terms.

## Changelog

- **2025-01-08**: Updated image filtering logic (by Bryan)
- **2014-12-04**: Data Looper 2.0 release with enhanced controls
