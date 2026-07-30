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
    bind_events();
}

/* all the event binding that needs to happen to make the UI behave as it should */
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
    source_upload.addEventListener('change', (e) => image.load_source(e.target.files[0], () => ui.refresh_ui() ));
    palette_upload.addEventListener('change', (e) => image.load_target(e.target.files[0], () => ui.refresh_ui() ));
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
        if(e.target.matches('.target_hex_select_button')) {
            ui.position_floating_element(e.target, ui_cache.palette_selector, 'top');
            ui.toggle_floating_element(ui_cache.palette_selector);
            ui_cache.palette_selector.dataset.source = e.target.closest("[data-source]").dataset.source;
        } else if(e.target.matches('.lock_button')) {
            e.target.classList.toggle('locked');
            e.target.classList.toggle('unlocked');

            const source = e.target.closest("[data-source]").dataset.source;
            if(e.target.classList.contains('locked')) {
                const target = e.target.closest("[data-target]").dataset.target;
                app.set_lock(source, target);
            } else {
                app.remove_lock(source);
            }
        }
    });
    document.getElementById('target_hex_select_list').addEventListener('click', (e) => {
        if(!e.target.matches('.swatch')) return;
        const source = ui_cache.palette_selector.dataset.source;
        const id = ui_cache.palette_selector.getAttribute('id');
        let row = document.querySelector(`[data-source*='${source}']:not(#${id})`);
        let colors = app.get_mapping().custom;
        ui.change_swatch_color(row, e.target.dataset.target);
        ui.toggle_floating_element(ui_cache.palette_selector);
        colors.set(ui_cache.palette_selector.dataset.source, e.target.dataset.target);
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