/*
    * main.js
    * This file contains the main application initialization and event binding logic.
*/

import * as app from "./app.js";
import * as image from "./image_utils.js";
import * as ui from "./ui_utils.js";
import { ui_cache, ui_cache_init } from "./ui_cache.js";

const sidebar_actions = {
    zoom_up             : (e) => ui.zoom_image(0.25),
    zoom_down           : (e) => ui.zoom_image(-0.25),
    lock_color          : (e) => ui.lock_color(e),
    image_panel         : (e) => ui.open_sidebar(e.target.dataset.action),
    palette_panel       : (e) => ui.open_sidebar(e.target.dataset.action),
    info_panel          : (e) => ui.open_sidebar(e.target.dataset.action),
    close_panel         : (e) => ui.close_sidebar(),
    toggle_pal_select   : (e) => ui.toggle_palette_selector(e.target)
};

const toolbar_actions = {
    undo                : (e) => app.regress_history(),
    redo                : (e) => app.advance_history(),
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

const keyboard_shortcuts = {
    "ctrl+z"        : (e) => toolbar_actions.undo(),
    "ctrl+y"        : (e) => toolbar_actions.redo(),
    "ctrl+shift+z"  : (e) => toolbar_actions.redo(),
    "r"             : (e) => toolbar_actions.rotate_90cw(),
    "ctrl+r"        : (e) => toolbar_actions.rotate_90ccw(),
    "ctrl+shift+r"  : (e) => toolbar_actions.rotate_180(),
    "="             : (e) => sidebar_actions.zoom_up(),
    "+"             : (e) => sidebar_actions.zoom_up(),
    "-"             : (e) => sidebar_actions.zoom_down(),
};

/* try our best to ensure that everything starts after the DOM has loaded */
window.addEventListener("DOMContentLoaded", () => {
    const demo_mode = document.getElementById("demo_css") ? true : false;
    initialize_app(demo_mode);
});

/* all the initialization that is required before the app is properly used */
function initialize_app(demo_mode = false) {
    ui_cache_init();
    bind_toolbar_events();
    bind_sidebar_events();
    bind_global_events();
    bind_keyboard_events();

    if(demo_mode) {
        image.load_source("/assets/demo/demo_source.png", (e) => ui.refresh_ui() );
        image.load_target("/assets/demo/demo_palette.png", (e) => ui.refresh_ui() );
    }
}

/* binding for all events that affect the entire app */
function bind_global_events() {
    document.addEventListener('click', (e) => ui.close_all_menus());
    document.addEventListener('image_upload', (e) => ui.refresh_ui());
    document.addEventListener('history_change', (e) => ui.refresh_ui());
    document.querySelectorAll('[data-tooltip]').forEach(el => ui.bind_tooltip(el));
    ui_cache.palette_selector.addEventListener('click', (e) => ui.set_custom_color(e.target));
}

/* binding for all events tied to keyboard shortcuts */
function bind_keyboard_events() {
    document.addEventListener("keydown", (e) => {
        const shortcut = shortcut_name(e);
        if (!keyboard_shortcuts[shortcut]) return;
        e.preventDefault();
        keyboard_shortcuts[shortcut]();
    });
}

/* binding for all events specific to the sidebar */
function bind_sidebar_events() {
    const sidebar = document.getElementById('sidebar');

    sidebar.querySelector('#color_map_method').addEventListener('change', (e) => ui.refresh_ui());
    sidebar.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(action) {
            sidebar_actions[action]?.(e);
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
    const source_toolbar_items = [
        'export_png', 
        'export_jpg', 
        'export_gif', 
        'flip_h', 
        'flip_v', 
        'rotate_90cw', 
        'rotate_90ccw', 
        'rotate_180'
    ];

    source_upload.addEventListener('change', (e) => image.load_source(e.target.files[0], () => ui.refresh_ui() ));
    palette_upload.addEventListener('change', (e) => image.load_target(e.target.files[0], () => ui.refresh_ui() ));
    toolbar.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(action) toolbar_actions[action]?.(e);
    });
    document.addEventListener('image_upload', (e) => {
        if(e.detail.type === "source") {
            ui.enable_toolbar_items(toolbar, source_toolbar_items); 
        }
    });
}

/* construct a string representation of a keyboard shortcut from a keyboard event */
function shortcut_name(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");
    parts.push(e.key.toLowerCase());
    return parts.join("+");
}