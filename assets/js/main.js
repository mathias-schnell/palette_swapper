/*
    * main.js
    * This file contains the main application initialization and event binding logic.
*/

import * as app from "./app.js";
import * as image from "./image_utils.js";
import * as ui from "./ui_utils.js";
import { ui_cache, ui_cache_init } from "./ui_cache.js";

const sidebar_actions = {
    lock_color          : (e) => ui.lock_color(e),
    toggle_panel        : (sidebar, tab, action) => ui.toggle_sidebar(sidebar, tab, action),
    toggle_pal_select   : (e) => ui.toggle_palette_selector(e.target),
};

const toolbar_actions = {
    undo                    : (e) => app.regress_history(),
    redo                    : (e) => app.advance_history(),
    zoom_in                 : (e) => ui.zoom_image(0.25),
    zoom_out                : (e) => ui.zoom_image(-0.25),
    load_source             : (e) => source_upload.click(),
    load_palette            : (e) => palette_upload.click(),
    flip_h                  : (e) => ui.flip_image_horizontal(),
    flip_v                  : (e) => ui.flip_image_vertical(),
    rotate_90cw             : (e) => ui.rotate_image(90),
    rotate_90ccw            : (e) => ui.rotate_image(-90),
    rotate_180              : (e) => ui.rotate_image(180),
    export_png              : (e) => image.export_image('untitled.png', 'image/png'),
    export_jpg              : (e) => image.export_image('untitled.jpg', 'image/jpeg'),
    export_gif              : (e) => image.export_image('untitled.gif', 'image/gif'),
    show_source_palette     : (e) => ui.show_palette_window(app.get_source().palette),
    show_target_palette     : (e) => ui.show_palette_window(app.get_target().palette),
};

const keyboard_shortcuts = {
    "ctrl+z"        : (e) => toolbar_actions.undo(),
    "ctrl+y"        : (e) => toolbar_actions.redo(),
    "ctrl+shift+z"  : (e) => toolbar_actions.redo(),
    "r"             : (e) => toolbar_actions.rotate_90cw(),
    "ctrl+r"        : (e) => toolbar_actions.rotate_90ccw(),
    "ctrl+shift+r"  : (e) => toolbar_actions.rotate_180(),
    "="             : (e) => toolbar_actions.zoom_in(),
    "+"             : (e) => toolbar_actions.zoom_in(),
    "-"             : (e) => toolbar_actions.zoom_out(),
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
    bind_history_events();
    bind_global_events();
    bind_keyboard_events();

    if(demo_mode) {
        image.load_source("/assets/demo/demo_source.png", (e) => ui.refresh_ui() );
        image.load_target("/assets/demo/demo_palette.png", (e) => ui.refresh_ui() );
    }
}

/* binding for all events that affect the entire app */
function bind_global_events() {
    document.addEventListener('click', (e) => ui.hide_floating_elements(e) );
    document.addEventListener('image_upload', (e) => ui.refresh_ui());
    document.addEventListener('history_change', (e) => ui.refresh_ui());
}

/* binding for all events specific to the history panel */
function bind_history_events() {
    const history = document.getElementById('history');

    history.querySelectorAll('[data-tooltip]').forEach(el => ui.bind_tooltip(ui_cache.history_tooltip, el, 'middle', 'left'));
    history.addEventListener('click', (e) => {
        const tab = e.target.closest('.history_tab');
        if (!tab) return;
        const action = tab.dataset.action;
        const panel_id = tab.dataset.panel;
        if(action) { sidebar_actions[action]?.(history, tab, panel_id); }
    });
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
    sidebar.querySelectorAll('[data-tooltip]').forEach(el => ui.bind_tooltip(ui_cache.sidebar_tooltip, el));
    sidebar.addEventListener('click', (e) => {
        const action_node = e.target.closest('[data-action]');
        if(!action_node) return;
        const action = action_node.dataset.action;
        if(action === "toggle_panel") {
            const tab = e.target.closest('.sidebar_tab');
            sidebar_actions[action]?.(sidebar, tab, tab.dataset.panel);
        } else {
            sidebar_actions[action]?.(e);
        }
    });
    ui_cache.palette_selector.addEventListener('click', (e) => ui.set_custom_color(e.target));
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
        'rotate_180',
        'zoom_in',
        'zoom_out',
        'show_source_palette',
    ];
    const target_toolbar_items = [
        'show_target_palette',
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
        if(e.detail.type === "target") {
            ui.enable_toolbar_items(toolbar, target_toolbar_items); 
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