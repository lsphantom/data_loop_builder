# Testing Guide for Data Loop Builder Web App

## Test Data Structure Created

We've created test image directories in `/Users/gpacheco/UCAR/Github_Backup/data_loop_builder/test_data/`:

### Sequence 1 (`sequence1/`)
- 5 PNG images: `frame_001.png` through `frame_005.png`
- Each image is 400x300 pixels with different background colors (red, green, blue, yellow, orange)
- Contains frame number text overlay
- **Test file**: `CONUS.jpg` (should be excluded by default filter)
- **Non-image file**: `readme.txt` (should be ignored)

### Sequence 2 (`sequence2/`)
- 4 JPG images: `image_01.jpg` through `image_04.jpg`
- Each image is 300x400 pixels with different background colors (purple, cyan, magenta, lime)
- Contains image number text overlay

## How to Test

1. **Open the Web App**: Navigate to http://localhost:8080
2. **Test Drag & Drop**:
   - Open Finder and navigate to the test_data folder
   - Drag the `sequence1` and `sequence2` folders onto the drop zone
3. **Test File Selection**:
   - Alternatively, click "Select Folders" and choose the test directories
4. **Verify Configuration**:
   - Check that PNG and JPG are selected in image types
   - Verify that `CONUS.jpg` is in the exclude list
5. **Generate Loops**:
   - Click "Generate Image Loops"
   - Watch the progress bar and processing log
6. **Test Results**:
   - Preview generated loops
   - Download individual loops
   - Download all loops as ZIP
   - Verify that loops work correctly with all controls

## Expected Results

### Sequence 1
- Should process 5 PNG images (excluding CONUS.jpg)
- Generated loop should show frames 1-5 cycling
- Controls should work: play/pause, step forward/back, speed control, reset

### Sequence 2
- Should process 4 JPG images
- Generated loop should show images 1-4 cycling
- All interactive controls should function

## Test Cases to Verify

1. **File Filtering**:
   - ✅ Only image files should be processed
   - ✅ CONUS.jpg should be excluded
   - ✅ Text files should be ignored

2. **Image Processing**:
   - ✅ Images should load as data URLs
   - ✅ Proper ordering by filename
   - ✅ Dimensions should be detected correctly

3. **Loop Generation**:
   - ✅ HTML should be well-formed
   - ✅ All images embedded correctly
   - ✅ Interactive controls functional

4. **User Interface**:
   - ✅ Progress tracking works
   - ✅ Folder list displays correctly
   - ✅ Results section shows processed loops
   - ✅ Download functionality works

5. **Generated Loop Features**:
   - ✅ Auto-play starts correctly
   - ✅ Play/pause button works
   - ✅ Step forward/backward functions
   - ✅ Speed controls adjust timing
   - ✅ Reset returns to first frame
   - ✅ Frame counter displays correctly

## Known Issues to Watch For

1. **Font Loading**: Glyphicon fonts may not load (but shouldn't break functionality)
2. **Large Images**: Performance may slow with very large images
3. **Browser Memory**: Many large images may consume significant memory

## Testing the Original Script Compatibility

You can also test that our generated loops match the original script output by running:

```bash
./loopBuilder.csh /Users/gpacheco/UCAR/Github_Backup/data_loop_builder/test_data png
```

This will create `index.htm` files in each sequence directory using the original script, which you can compare with our web app output.

## Success Criteria

The test is successful if:
1. Both image directories are processed without errors
2. Generated HTML loops display and animate correctly
3. All interactive controls function as expected
4. Download functionality works for both individual and batch downloads
5. The generated loops match the quality and functionality of the original script