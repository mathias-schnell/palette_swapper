# Changelog

## [0.8.6] - 2026-08-11

### Internal
- Renamed several UI elements to better communicate purpose and hierarchy.
- Split `main.css` into several modules, such as `toolbar.css`, `variables.css` and `general.css`.
- `main.css` is now just a hub for importing other stylesheets.
- Laid groundwork for themeing with `variables.css`.
- Cleaned up HTML framework, UI cache and stylesheets of unused code.

---

## [0.8.5] - 2026-08-11

### Internal
- Added DOM body to the UI Cache.
- Demo mode on/off and current theme are now properties of the DOM body.
- `main.css` now imports `reset.css` and `demo.css` rather than the index page.
- Toolbar buttons are now actual `<button>` tags to help with accessibility.
- Internal functions changed to work with new toolbar `<button>`s.

---

## [0.8.4] - 2026-08-07

### Added
- Two new toolbar items: "Show Source Palette" and "Show Target Palette". These will display closeable modal windows that show the full palette of the uploaded source image and the uploaded target palette. You can also mouse over each color to get a readout of the hex color code for that color.

### Changed
- Lots of styling changes and additions to accommodate the new palette modals.
- "Color Palette" tab has been renamed to "Color Mapping" and some naming inside also changed.
- Slight UI tweaks to make tabs look nicer.
- "DEMO" banner was changed from a diagonal banner to a simple red block in the top-right corner.
- There are no more "Close" tabs. Tabs will instead toggle open and closed when clicked.
- Arrows were added to tabs to signify the direction the panels will slide when those tabs are clicked.
- Toolbar items that are enabled or disabled and their triggers have been updated.

### Internal
- `ROADMAP.md` has been updated.

---

## [0.8.3] - 2026-08-06

### Added
- New sidebar on the right side of the screen with a 'Action History' tab. Opening it will display a panel that shows a user-readable list of the Action History.

### Changed
- Lots of stylings changed or added to accommodate new history sidebar.

### Internal
- Lots of adjustments to accommodate new history sidebar and its own tooltips.
- The history sidebar is stored in its own PHP file called `history.php`.
- Removed some event bindings that weren't being used anymore.

---

## [0.8.2] - 2026-08-05

### Removed
- Deleted `history_utils.js`

---

## [0.8.1] - 2026-08-05

### Added
- Zoom controls were added to the "Edit" menu in the toolbar and renamed to "Zoom In" and "Zoom Out".

### Changed
- Sidebar panels for "Image Settings" and "Image Info" were removed.

---

## [0.8.0] - 2026-08-04

### Added
- A history of actions is now part of the app state and can be interacted with.
- Zoom in/out/up/down, horizontal and vertical flipping, and image rotation are all recorded in the action history. More actions to be added in later versions.
- Undo and Redo are implementedm, added to the toolbar and interact with the action history as expected.
- Keyboard shortcuts are implemented. Currently works with Undo (CTRL+Z), Redo (CTRL+Y), Zoom In (+), Zoom Out(-), Rotate 90 CW(R), Rotate 90 CCW(CTRL+R) and Rotate 180(CTRL+SHIFT+R).

### Internal
- Some code cleanup and reorganization to ensure that the UI is more consistent and getting its information from the action history first and foremost.
- Added functions to `app.js` to interact with the action history and rebuild the transformation state everytime a change is made.

---

## [0.7.3] - 2026-07-31

### Fixed
- Image exporting fixed. Some exports weren't exporting the image exactly as seen in the canvas.
- Palette swapping function should be more optimized and faster.

### Internal
- Rendering pipeline was made more robust and structured into stages.
- The app state's storage of transforms was changed to a Javascript Map object instead of a standard object.

---

## [0.7.2] - 2026-07-30

### Added
- Javascript Custom Events implemented.

### Fixed
- UI won't refresh immediately on app start in Demo Mode. Should stop or reduce occurence of a canvas bug.

### Internal
- Demo Mode logic moved slightly for better organization and to prevent possible errors.
- Removed callbacks from `load_source` and `load_target` functions in `image_utils.js`. Replaced with Custom Events.
- `main.js` listens for Custom Events from image upload functions to trigger other things.
- Tooltip binding logic moved into a new function inside `ui_utils.js`.
- New UI function added to `ui_utils.js` to enable toolbar items and their parent elements.

---

## [0.7.1] - 2026-07-30

### Changed
- Sidebar tabs were changed from having `data-panel` attributes to `data-action` attributes
- `data-action` attributes also added to zoom buttons, color map method dropdown and color lock icons

### Internal
- Split event binding logic in main.js into three categories: global, sidebar and toolbar
- Cleaned up bindings in all categories so most are defined by a list of actions and `data-action` attributes when possible
- Moved some logic from within `main.js` to `ui_utils.js` to further condense `main.js`
- All actions in the lists have access to an `e` variable now to pass along to the internal functions where `e` is the event that activated the action

---

## [0.7.0] - 2026-07-29

### Added
- Image transformation pipeline.
- Rotation (90° CW, 90° CCW, 180°).
- Horizontal and vertical image flipping.
- Demo mode with bundled sample image and palette.
- Toolbar item enable/disable states.

### Changed
- Switched palette extraction and application to 32-bit pixel operations for improved performance.
- Split index page into modular PHP components.
- Toolbar actions now use delegated event handling through `data-action` attributes.
- Toolbar is now generated dynamically from a config file.
- Separated HTML configuration into dedicated configuration files.

### Internal
- Converted palettes, color maps, and lock map to JavaScript `Map` objects.
- Split canvas logic into `canvas_utils.js`.
- Improved rendering architecture.
- Additional code cleanup and documentation.

---

## [0.6.0] - 2026-07-17

### Added
- Color locking.
- Export image functionality.

### Changed
- Unified UI redraws behind a single controller function.
- Improved tooltip positioning.
- Palette selector redesigned as an interactive swatch picker.

### Fixed
- Locked colors now remain consistent across mapping methods.
- Fixed custom mode palette selector visibility.

---

## [0.5.0] - 2026-06-26

### Changed
- Major application refactor.
- Centralized application state.
- Introduced getter/setter API.
- Introduced UI cache.
- Improved module separation.
- Refined floating UI positioning.

### Internal
- Split large functions into smaller reusable helpers.
- Improved mutability handling.

---

## [0.4.0] - 2026-06-22

### Added
- Toolbar UI.
- Custom palette mapping.
- Multiple color distance algorithms:
  - RGB
  - Weighted RGB
  - HSV
  - LAB
  - Oklab

### Changed
- JavaScript converted to ES Modules.
- Improved dependency management.

### Fixed
- Source image and target image/palette can now be loaded in arbitrary order.

---

## [0.3.0] - 2026-06-15

### Added
- Target palette loading.
- Palette mapping display.
- Canvas rendering.
- RGB/Hex conversion utilities.

### Changed
- Application moved almost entirely to JavaScript.
- Large PHP reduction.
- JavaScript split into multiple modules.

---

## [0.2.0] - 2026-06-12

### Added
- Sliding sidebar.
- Information panels.
- Image information.
- Scaling controls.
- Tooltips.
- Improved image preview.

### Changed
- Switched from `<img>` rendering to `<canvas>`.
- Significant UI/UX improvements.

---

## [0.1.0] - 2026-06-05

### Added
- Initial project.
- Image loading.
- Image type handling.
- Error reporting.
- Helper utilities.
