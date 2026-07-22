<?php
    require_once 'includes/error_conf.php';
    require_once 'includes/helper_funcs.php';
?>
<!doctype html>
<html>
    <head>
        <title>Palette Swapper</title>
        <script type="module" src="assets/js/main.js"></script>
        <link rel="stylesheet" href="assets/css/reset.css">
        <link rel="stylesheet" href="assets/css/main.css">
    </head>
    <body>
        <input type="file" id="image_upload" name="source_image" hidden>
        <input type="file" id="target_upload" name="target_upload" hidden>
        <div id="toolbar" class="toolbar">
            <div class="toolbar_item" data-menu="file">File
                <div id="menu_file" class="toolbar_menu">
                    <div id="load_source_image" class="toolbar_item">Load Source Image</div>
                    <div id="load_target_palette" class="toolbar_item">Load Target Palette</div>
                </div>
            </div>
            <div class="toolbar_item" data-menu="edit">Edit
                <div id="menu_edit" class="toolbar_menu">
                    <div id="rotate_90cw" class="toolbar_item">Rotate 90° CW</div>
                    <div id="rotate_90ccw" class="toolbar_item">Rotate 90° CCW</div>
                    <div id="rotate_180" class="toolbar_item">Rotate 180°</div>
                </div>
            </div>
            <div class="toolbar_item" data-menu="image">Image
                <div id="menu_image" class="toolbar_menu">
                    <div id="export_image" class="toolbar_item">Export Image</div>
                </div>
            </div>
            <div class="toolbar_item">Palette</div>
        </div>
        <div id="sidebar" class="sidebar">
            <div id="sidebar_panel_container" class="sidebar_panel_container">
                <div id="image_panel" class="sidebar_panel">
                    <div id="zoom_block">
                        <h2>Zoom</h2>
                        <p>
                            <input id="zoom_input" name="zoom" readonly value="1.00">
                            <button type="button" id="zoom_up">+</button>
                            <button type="button" id="zoom_down">-</button>
                        </p>
                    </div>
                </div>
                <div id="palette_panel" class="sidebar_panel">
                    <div id="color_map_block">
                        <h2>Color Mapping Presets</h2>
                        <select id="color_map_method" name="color_map_method">
                            <option value="reset">Reset</option>
                            <option value="rgb">RGB</option>
                            <option value="rgb_w">Weighted RGB</option>
                            <option value="lab">LAB</option>
                            <option value="oklab">Oklab</option>
                            <option value="hsv">HSV</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <h2>Color Palette</h2>
                    <div id="palette_container">
                        <div id="palette_row_prime" class="palette_row">
                            <div class="lock_button unlocked"></div>
                            <div class="source_color">
                                <span class="swatch source_swatch"></span><span class="source_hex"></span>
                            </div>
                            →
                            <div class="target_color">
                                <span class="swatch target_swatch"></span><span class="target_hex"></span>
                                <div class="target_hex_select_button">&#9205;</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="info_panel" class="sidebar_panel">
                    <div id="info_dimensions">
                        <h2>Dimensions</h2>
                        <p><span class="source_width">px</span> × <span class="source_height">px</span></p>
                    </div>
                    <div id="info_colors">
                        <h2>Unique Colors</h2>
                        <p><span class="unique_colors"></span></p>
                    </div>
                </div>
            </div>
            <div class="sidebar_tabs">
                <div class="sidebar_tab" data-panel="image_panel" data-tooltip="Image Settings">🖼</div>
                <div class="sidebar_tab" data-panel="palette_panel" data-tooltip="Color Palette">🎨</div>
                <div class="sidebar_tab" data-panel="info_panel" data-tooltip="Image Info">ℹ</div>
                <div class="sidebar_tab" data-panel="close" data-tooltip="Close">×</div>
            </div>
        </div>
        <div id="target_hex_select_list" class="hidden"></div>
        <img src="" id="source_image" name="source_image" alt="Source Image" />
        <div class="workspace">
            <div class="canvas_container">
                <canvas id="preview_canvas" name="preview_canvas"></canvas>
            </div>
        </div>
        <div id="tooltip" class="hidden"></div>
    </body>
</html>