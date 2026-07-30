# Changelog

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