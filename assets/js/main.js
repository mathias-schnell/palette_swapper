import { app } from "./app.js"
import * as image from "./image_utils.js"
import * as ui from "./ui_utils.js"

initialize_app();
bind_events();

function initialize_app() {
    app.canvas.element = document.getElementById('preview_canvas');
    if (app.canvas.element) {
        app.canvas.ctx = app.canvas.element.getContext('2d', { willReadFrequently: true });
    }
    Object.entries(app.ui).forEach(([key]) => {
        app.ui[key] = document.getElementById(key);
    });
}

function bind_events() {
    let palette_selector = document.getElementById('target_hex_select_list');
    document.addEventListener('click', ui.close_all_menus);
    document.getElementById('scale_up').addEventListener('click', () => ui.adjust_scale(0.25));
    document.getElementById('scale_down').addEventListener('click', () => ui.adjust_scale(-0.25));
    document.getElementById('color_map_method').addEventListener('change', ui.update_palette_map);
    document.getElementById('apply_palette_changes').addEventListener('click', ui.redraw_preview);
    document.getElementById('load_source_image').addEventListener('click', () => document.getElementById('image_upload').click());
    document.getElementById('load_target_palette').addEventListener('click', () => document.getElementById('target_upload').click());
    document.getElementById('export_image').addEventListener('click', () => image.export_image());
    document.getElementById('image_upload').addEventListener('change', e =>
        image.load_source_image(e, () => {
            ui.redraw_palette();
            ui.redraw_preview();
        })
    );
    document.addEventListener('click', (e) => {
        if(e.target.matches('#target_hex_select_list') || e.target.matches('.target_hex_select_button')) return;
        ui.toggle_floating_element(palette_selector, true);
    });
    document.getElementById('palette_container').addEventListener('click', (e) => {
        if(!e.target.matches('.target_hex_select_button')) return;
        ui.position_floating_element(e.target, palette_selector, 'top');
        ui.toggle_floating_element(palette_selector);
        palette_selector.dataset.source = e.target.closest("[data-source]").dataset.source;
    });
    document.getElementById('target_hex_select_list').addEventListener('click', (e) => {
        if(!e.target.matches('.swatch')) return;
        let row = document.querySelector("[data-source*='" + palette_selector.dataset.source, + "']:not(#" + palette_selector.getAttribute('id') + ")");
        ui.change_swatch_color(row, e.target.dataset.target);
        ui.toggle_floating_element(palette_selector);
        app.mapping.custom[palette_selector.dataset.source] = e.target.dataset.target;
        palette_selector.dataset.source = null;
    });
    document.getElementById('target_upload').addEventListener('change', e =>
        image.load_target_image(e, () => {
            ui.redraw_palette();
        })
    );
    document.querySelectorAll('.sidebar_tabs > .sidebar_tab').forEach(
        element => element.addEventListener('click', () => { 
            element.dataset.panel === 'close' ? ui.close_sidebar() : ui.open_sidebar(element.dataset.panel); 
        })
    );
    document.querySelectorAll('.toolbar_item[data-menu]').forEach(element => {
        element.addEventListener('click', e => { 
            e.stopPropagation();
            ui.open_menu(`menu_${element.dataset.menu}`);
        });
    });
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const tooltip = document.getElementById('tooltip');
        let tooltip_timer = null;
        element.addEventListener('mouseenter', (e) => {
            tooltip.textContent = e.target.dataset.tooltip;
            ui.position_floating_element(e.target, tooltip);
            ui.toggle_floating_element(tooltip);
        });
        element.addEventListener('mouseleave', (e) => {
            ui.toggle_floating_element(tooltip, true);
        });
    });
    
}