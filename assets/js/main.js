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
    document.getElementById('image_upload').addEventListener('change', (e) => image.load_source_image(e, () => ui.refresh_ui() ));
    document.getElementById('target_upload').addEventListener('change', (e) => image.load_target_image(e, () => ui.refresh_ui() ));

    /* sidebar bindings */
    const sidebar = document.getElementById('sidebar');
    sidebar.querySelector('#zoom_up').addEventListener('click', () => ui.adjust_scale(0.25));
    sidebar.querySelector('#zoom_down').addEventListener('click', () => ui.adjust_scale(-0.25));
    sidebar.querySelector('#color_map_method').addEventListener('change', () => ui.refresh_ui());

    /* toolbar bindings */
    const toolbar = document.getElementById('toolbar');
    toolbar.querySelector('#load_source_image').addEventListener('click', () => document.getElementById('image_upload').click());
    toolbar.querySelector('#load_target_palette').addEventListener('click', () => document.getElementById('target_upload').click());
    toolbar.querySelector('#rotate_90cw').addEventListener('click', () => ui.rotate_image(90));
    toolbar.querySelector('#rotate_90ccw').addEventListener('click', () => ui.rotate_image(-90));
    toolbar.querySelector('#rotate_180').addEventListener('click', () => ui.rotate_image(180));
    toolbar.querySelector('#export_image').addEventListener('click', () => image.export_image());
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
            app.add_lock(e.target.closest("[data-source]").dataset.source, e.target.closest("[data-target]").dataset.target);
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