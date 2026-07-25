/*
    * main.js
    * This file contains the main application initialization and event binding logic.
*/

import * as app from "./app.js";
import * as image from "./image_utils.js";
import * as ui from "./ui_utils.js";
import { ui_cache, ui_cache_init } from "./ui_cache.js";

window.addEventListener("DOMContentLoaded", () => {
    initialize_app();
});

function initialize_app() {
    ui_cache_init();
    bind_events();
}

function bind_events() {
    const sidebar = document.getElementById('sidebar');
    const toolbar = document.getElementById('toolbar');
    const source_upload = toolbar.querySelector('#source_upload');
    const palette_upload = toolbar.querySelector('#palette_upload');
    const actions = {
        load_source         : () => source_upload.click(),
        load_palette        : () => palette_upload.click(),
        flip_h              : () => ui.flip_image_horizontal(),
        flip_v              : () => ui.flip_image_vertical(),
        rotate_90cw         : () => ui.rotate_image(90),
        rotate_90ccw        : () => ui.rotate_image(-90),
        rotate_180          : () => ui.rotate_image(180),
        export_png          : () => image.export_image('untitled.png', 'image/png'),
        export_jpg          : () => image.export_image('untitled.jpg', 'image/jpeg'),
        export_gif          : () => image.export_image('untitled.gif', 'image/gif')
    };

    /* sidebar bindings */
    sidebar.querySelector('#zoom_up').addEventListener('click', () => ui.zoom_image(0.25));
    sidebar.querySelector('#zoom_down').addEventListener('click', () => ui.zoom_image(-0.25));
    sidebar.querySelector('#color_map_method').addEventListener('change', () => ui.refresh_ui());

    /* toolbar bindings */
    source_upload.addEventListener('change', (e) => image.load_source_image(e, () => ui.refresh_ui() ));
    palette_upload.addEventListener('change', (e) => image.load_target_image(e, () => ui.refresh_ui() ));
    toolbar.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(!action) return;
        actions[action]?.();
    });
    document.addEventListener('click', ui.close_all_menus);

    document.addEventListener('click', (e) => {
        if(e.target.matches('#target_hex_select_list') || e.target.matches('.target_hex_select_button')) return;
        ui.toggle_floating_element(ui_cache.palette_selector, true);
    });
    document.getElementById('palette_container').addEventListener('click', (e) => {
        if(!e.target.matches('.target_hex_select_button')) return;
        ui.position_floating_element(e.target, ui_cache.palette_selector, 'top');
        ui.toggle_floating_element(ui_cache.palette_selector);
        ui_cache.palette_selector.dataset.source = e.target.closest("[data-source]").dataset.source;
    });
    document.getElementById('palette_container').addEventListener('click', (e) => {
        if(!e.target.matches('.lock_button')) return;
        e.target.classList.toggle('locked');
        e.target.classList.toggle('unlocked');
        if(e.target.classList.contains('locked')) {
            app.set_lock(e.target.closest("[data-source]").dataset.source, e.target.closest("[data-target]").dataset.target);
        } else {
            app.remove_lock(e.target.closest("[data-source]").dataset.source);
        }
    });
    document.getElementById('target_hex_select_list').addEventListener('click', (e) => {
        if(!e.target.matches('.swatch')) return;
        let row = document.querySelector("[data-source*='" + ui_cache.palette_selector.dataset.source + "']:not(#" + ui_cache.palette_selector.getAttribute('id') + ")");
        let colors = app.get_mapping().custom;
        ui.change_swatch_color(row, e.target.dataset.target);
        ui.toggle_floating_element(ui_cache.palette_selector);
        colors[ui_cache.palette_selector.dataset.source] = e.target.dataset.target;
        app.update_mapping({custom: colors});
        ui_cache.palette_selector.dataset.source = null;
        ui.refresh_ui(false, false, true, false);
    });
    document.querySelectorAll('.sidebar_tabs > .sidebar_tab').forEach(
        element => element.addEventListener('click', () => { 
            element.dataset.panel === 'close' ? ui.close_sidebar() : ui.open_sidebar(element.dataset.panel); 
        })
    );
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