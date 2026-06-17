<?php
    require_once 'includes/error_conf.php';
    require_once 'includes/helper_funcs.php';
?>
<!doctype html>
<html>
    <head>
        <title>Palette Swapper</title>
        <script type="text/javascript" src="assets/js/helper_funcs.js" defer></script>
        <script type="text/javascript" src="assets/js/main.js" defer></script>
        <link rel="stylesheet" href="assets/css/reset.css">
        <link rel="stylesheet" href="assets/css/main.css">
    </head>
    <body>
        <div id="sidebar" class="sidebar">
            <div id="sidebar_panel_container" class="sidebar_panel_container">
                <div id="image_panel" class="sidebar_panel">
                    <form method="post" enctype="multipart/form-data">
                        <label for="image_upload" class="upload_button">
                            Load Image
                            <input type="file" id="image_upload" name="source_image" hidden>
                        </label>                        
                    </form>
                        <h2>Scale</h2>
                        <p>
                            <input id="scale_input" name="scale" readonly value="1.00">
                            <button type="button" id="scale_up">+</button>
                            <button type="button" id="scale_down">-</button>
                        </p>
                </div>
                <div id="palette_panel" class="sidebar_panel">
                    <label for="target_upload" class="upload_button">
                        Load Palette
                        <input type="file" id="target_upload" name="target_upload" hidden>
                    </label>
                    <br /><br />
                    <h2>Color Mapping Presets</h2>
                    <select id="color_map_method" name="color_map_method">
                        <option value="reset">Reset</option>
                        <option value="rgb">RGB</option>
                        <option value="rgb_w">Weighted RGB</option>
                        <option value="lab">LAB</option>
                        <option value="oklab">Oklab</option>
                        <option value="hsv">HSV</option>
                    </select>
                    <button id="apply_palette_changes" name="apply_palette_changes">Apply Changes</button>
                    <br /><br />
                    <h2>Color Palette</h2>
                    <div id="palette_container">
                        <div id="palette_row_prime" class="palette_row">
                            <span class="swatch source_swatch"></span> → <span class="swatch target_swatch"></span>
                            <span class="source_hex"></span> → <span class="target_hex"></span>
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
            <img src="" id="source_image" name="source_image" alt="Source Image" />
            <div class="workspace">
                <div class="canvas_container">
                    <canvas id="preview_canvas" name="preview_canvas"></canvas>
                </div>
            </div>
        <div id="tooltip"></div>
    </body>
</html>