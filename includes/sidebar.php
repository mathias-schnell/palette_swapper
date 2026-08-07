<div id="sidebar" class="sidebar">
    <div id="sidebar_panel_container" class="sidebar_panel_container">
        <div id="palette_panel" class="sidebar_panel">
            <div id="color_map_block">
                <h2>Mapping Presets</h2>
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
            <h2>Color Mappings</h2>
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
    </div>
    <div class="sidebar_tabs">
        <div class="sidebar_tab" data-action="toggle_panel" data-panel="palette_panel" data-tooltip="Color Mapping">
            <div class='tab_icon'>🎨</div>
            <div class='tab_arrow'></div>
        </div>
    </div>
</div>
<div id="target_hex_select_list" class="hidden"></div>
<div id="sidebar_tooltip" class="hidden"></div>