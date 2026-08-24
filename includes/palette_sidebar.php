<div id="palette_sidebar" class="palette_sidebar">
    <div id="mapping_panel_container" class="mapping_panel_container">
        <div id="mapping_panel" class="mapping_panel">
            <div id="mapping_method_container" class="mapping_method_container">
                <h3>Mapping Presets</h3>
                <select id="mapping_method" class="mapping_method" data-action="mapping_method">
                    <option value="reset">Reset</option>
                    <option value="rgb">RGB</option>
                    <option value="rgb_w">Weighted RGB</option>
                    <option value="lab">LAB</option>
                    <option value="oklab">Oklab</option>
                    <option value="hsv">HSV</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            <h3>Color Mappings</h3>
            <div id="palette_row_container" class="palette_row_container">
                <div id="palette_row_prime" class="palette_row">
                    <div class="lock_button unlocked" data-action="lock_color"></div>
                    <div class="source_color">
                        <span class="swatch source_swatch"></span><span class="source_hex"></span>
                    </div>
                    →
                    <div class="target_color">
                        <span class="swatch target_swatch"></span><span class="target_hex"></span>
                        <div class="palette_select_button" data-action="toggle_pal_select">&#9205;</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="tab_container">
        <div class="tab" data-action="toggle_panel" data-panel="mapping_panel" data-tooltip="Color Mapping">
            <div class='tab_icon'>🌈</div>
            <div class='tab_arrow'></div>
        </div>
    </div>
</div>
<div id="palette_select_list" class="palette_select_list hidden"></div>
<div id="palette_tooltip" class="palette_tooltip hidden"></div>