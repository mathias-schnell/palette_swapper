<div id="sidebar" class="sidebar">
    <div id="sidebar_panel_container" class="sidebar_panel_container">
        <div id="image_panel" class="sidebar_panel">
            <div id="zoom_block">
                <h2>Zoom</h2>
                <p>
                    <input id="zoom_input" name="zoom" readonly value="1.00">
                    <button type="button" id="zoom_up" data-action="zoom_up">+</button>
                    <button type="button" id="zoom_down" data-action="zoom_down">-</button>
                </p>
            </div>
        </div>
        <div id="palette_panel" class="sidebar_panel">
            <div id="color_map_block">
                <h2>Color Mapping Presets</h2>
                <select name="color_map_method" id="color_map_method" data-action="color_map_method">
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
                    <div class="lock_button unlocked" data-action="lock_color"></div>
                    <div class="source_color">
                        <span class="swatch source_swatch"></span><span class="source_hex"></span>
                    </div>
                    →
                    <div class="target_color">
                        <span class="swatch target_swatch"></span><span class="target_hex"></span>
                        <div class="target_hex_select_button" data-action="toggle_pal_select">&#9205;</div>
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
        <div class="sidebar_tab" data-action="image_panel" data-tooltip="Image Settings">🖼</div>
        <div class="sidebar_tab" data-action="palette_panel" data-tooltip="Color Palette">🎨</div>
        <div class="sidebar_tab" data-action="info_panel" data-tooltip="Image Info">ℹ</div>
        <div class="sidebar_tab" data-action="close_panel" data-tooltip="Close">×</div>
    </div>
</div>
<div id="target_hex_select_list" class="hidden"></div>
<div id="tooltip" class="hidden"></div>