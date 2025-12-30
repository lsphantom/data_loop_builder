Test Data - Sequence 1 (Overlay Test)

This folder contains test images designed to test the overlay detection and toggle functionality:

Loop Images (6 JPG files):
- loop_01.jpg through loop_06.jpg
- Colored backgrounds: red, green, blue (repeating pattern)
- These will be detected as loop frames

Overlay Image (1 PNG file):
- overlay.png
- Transparent PNG that will be detected as overlay layer
- Should trigger overlay toggle button in navigation controls

Exclusion Test:
- CONUS.jpg (should be automatically excluded from processing)

Expected Behavior:
- The app should detect 6 loop frames (JPG files)
- The PNG should be detected as an overlay
- Overlay toggle button should appear in navigation controls
- CONUS.jpg should be excluded from processing

This tests the overlay detection logic:
- Single PNG + multiple JPGs = PNG becomes overlay