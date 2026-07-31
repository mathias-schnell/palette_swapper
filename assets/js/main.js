/*
    * main.js
    * This file contains the main application initialization and event binding logic.
*/

import * as app from "./app.js";
import * as image from "./image_utils.js";
import * as ui from "./ui_utils.js";
import { ui_cache, ui_cache_init } from "./ui_cache.js";

let demo_mode = false;

/* try our best to ensure that everything starts after the DOM has loaded */
window.addEventListener("DOMContentLoaded", () => {
    demo_mode = document.getElementById("demo_css") ? true : false;
    if(demo_mode) {
        image.load_source("/assets/demo/demo_source.png", () => ui.refresh_ui() );
        image.load_target("/assets/demo/demo_palette.png", () => ui.refresh_ui() );
    }
    initialize_app();
});

/* all the initialization that is required before the app is properly used */
function initialize_app() {
    ui_cache_init();
    bind_toolbar_events();
    bind_sidebar_events();
    bind_global_events();
}

/* binding for all events that affect the entire app */
function bind_global_events() {
    document.addEventListener('click', ui.close_all_menus);
    document.querySelectorAll('[data-tooltip]').forEach(e => {
        const tooltip = ui_cache.tooltip;
        let tooltip_timer = null;
        e.addEventListener('mouseenter', (e) => {
            tooltip.textContent = e.target.dataset.tooltip;
            ui.position_floating_element(e.target, tooltip);
            ui.toggle_floating_element(tooltip);
        });
        e.addEventListener('mouseleave', (e) => {
            ui.toggle_floating_element(tooltip, true);
        });
    });

    ui_cache.palette_selector.addEventListener('click', (e) => {
        ui.set_custom_color(e.target);
    });
}

/* binding for all events specific to the sidebar */
function bind_sidebar_events() {
    const sidebar = document.getElementById('sidebar');
    const actions = {
        zoom_up             : (e) => ui.zoom_image(0.25),
        zoom_down           : (e) => ui.zoom_image(-0.25),
        lock_color          : (e) => ui.lock_color(e),
        image_panel         : (e) => ui.open_sidebar(e.target.dataset.action),
        palette_panel       : (e) => ui.open_sidebar(e.target.dataset.action),
        info_panel          : (e) => ui.open_sidebar(e.target.dataset.action),
        close_panel         : (e) => ui.close_sidebar(),
        toggle_pal_select   : (e) => ui.toggle_palette_selector(e.target)
    };

    sidebar.querySelector('#color_map_method').addEventListener('change', () => ui.refresh_ui());
    sidebar.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(action) {
            actions[action]?.(e);
        } else if(!e.target.matches('#target_hex_select_list') && !e.target.matches('.target_hex_select_button')) {
            ui.toggle_floating_element(ui_cache.palette_selector, true);
        }
    });
}

/* binding for all events specific to the toolbar */
function bind_toolbar_events() {
    const toolbar = document.getElementById('toolbar');
    const source_upload = toolbar.querySelector('#source_upload');
    const palette_upload = toolbar.querySelector('#palette_upload');
    const actions = {
        load_source         : (e) => source_upload.click(),
        load_palette        : (e) => palette_upload.click(),
        flip_h              : (e) => ui.flip_image_horizontal(),
        flip_v              : (e) => ui.flip_image_vertical(),
        rotate_90cw         : (e) => ui.rotate_image(90),
        rotate_90ccw        : (e) => ui.rotate_image(-90),
        rotate_180          : (e) => ui.rotate_image(180),
        export_png          : (e) => image.export_image('untitled.png', 'image/png'),
        export_jpg          : (e) => image.export_image('untitled.jpg', 'image/jpeg'),
        export_gif          : (e) => image.export_image('untitled.gif', 'image/gif')
    };

    source_upload.addEventListener('change', (e) => image.load_source(e.target.files[0], () => ui.refresh_ui() ));
    palette_upload.addEventListener('change', (e) => image.load_target(e.target.files[0], () => ui.refresh_ui() ));
    toolbar.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(!action) return;
        actions[action]?.(e);
    });
}