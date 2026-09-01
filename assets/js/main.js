/*
    * main.js
    * This file contains the main application initialization and event binding logic.
*/

import * as app from "./app.js";
import * as image from "./image_utils.js";
import * as ui from "./ui_utils.js";
import { ui_cache, ui_cache_init } from "./ui_cache.js";

const sidebar_actions = {
    lock_color              : (e) => ui.lock_color(e),
    remove_history          : (e) => app.remove_from_history(e.target.dataset.index),
    toggle_panel            : (sidebar, tab, panel) => ui.toggle_panel(sidebar, tab, panel),
    show_source_palette     : (sidebar, tab, panel) => ui.toggle_panel(sidebar, tab, panel),
    show_target_palette     : (sidebar, tab, panel) => ui.toggle_panel(sidebar, tab, panel),
    toggle_pal_select       : (e) => ui.toggle_palette_selector(e.target),
};

const toolbar_actions = {
    undo                    : () => { app.regress_history(); app.rebuild_transforms(); },
    redo                    : () => { app.advance_history(); app.rebuild_transforms(); },
    zoom_in                 : () => ui.zoom_image(0.25),
    zoom_out                : () => ui.zoom_image(-0.25),
    load_source             : () => ui_cache.upload_source.click(),
    load_palette            : () => ui_cache.upload_palette.click(),
    flip_h                  : () => ui.flip_image_horizontal(),
    flip_v                  : () => ui.flip_image_vertical(),
    rotate_90cw             : () => ui.rotate_image(90),
    rotate_90ccw            : () => ui.rotate_image(-90),
    rotate_180              : () => ui.rotate_image(180),
    export_png              : () => image.export_image('untitled.png', 'image/png'),
    export_jpg              : () => image.export_image('untitled.jpg', 'image/jpeg'),
    export_gif              : () => image.export_image('untitled.gif', 'image/gif'),
    theme_light             : () => ui_cache.body.dataset.theme = "light",
    theme_dark              : () => ui_cache.body.dataset.theme = "dark",
    show_source_panel       : () => ui.toggle_panel_from_toolbar(ui_cache.palette_sidebar, "source_panel"),
    show_target_panel       : () => ui.toggle_panel_from_toolbar(ui_cache.palette_sidebar, "target_panel"),
    show_mapping_panel      : () => ui.toggle_panel_from_toolbar(ui_cache.palette_sidebar, "mapping_panel"),
    show_history_panel      : () => ui.toggle_panel_from_toolbar(ui_cache.history_sidebar, "history_panel"),
};

const keyboard_shortcuts = {
    "escape"        : () => ui.hide_toolbar_menus(ui_cache.toolbar),
    "ctrl+z"        : () => toolbar_actions.undo(),
    "ctrl+y"        : () => toolbar_actions.redo(),
    "ctrl+shift+z"  : () => toolbar_actions.redo(),
    "r"             : () => toolbar_actions.rotate_90cw(),
    "ctrl+r"        : () => toolbar_actions.rotate_90ccw(),
    "ctrl+shift+r"  : () => toolbar_actions.rotate_180(),
    "ctrl+h"        : () => toolbar_actions.flip_h(),
    "ctrl+v"        : () => toolbar_actions.flip_v(),
    "="             : () => toolbar_actions.zoom_in(),
    "+"             : () => toolbar_actions.zoom_in(),
    "-"             : () => toolbar_actions.zoom_out(),
};

/* try our best to ensure that everything starts after the DOM has loaded */
window.addEventListener("DOMContentLoaded", () => {
    initialize_app();
});

/* all the initialization that is required before the app is properly used */
function initialize_app() {
    app.reset();
    ui_cache_init();
    bind_toolbar_events();
    bind_palette_sidebar_events();
    bind_history_sidebar_events();
    bind_global_events();
    bind_keyboard_events();

    if(ui_cache.body.dataset.demo === "true") {
        image.load_source("/assets/demo/demo_source.png");
        image.load_target("/assets/demo/demo_palette.png");
    }
    ui_cache.body.dataset.theme = "light";
}

/* binding for all events that affect the entire app */
function bind_global_events() {
    document.addEventListener('click', (e) => {
        if (!ui_cache.toolbar.contains(e.target)) {
            ui.hide_toolbar_menus(ui_cache.toolbar);
        }
        ui.hide_floating_elements(e);
    });
    document.addEventListener('history_change', () => ui.refresh_ui());
    document.addEventListener('image_upload', (e) => {
        if(e.detail.type === "source") {
            const panel = ui_cache.palette_sidebar.querySelector('#source_panel');
            ui.draw_palette_in_panel(panel, app.get_source_palette());
        }
        if(e.detail.type === "target") {
            const panel = ui_cache.palette_sidebar.querySelector('#target_panel');
            ui.draw_palette_in_panel(panel, app.get_target_palette());
            ui.populate_palette_selector(ui_cache.palette_select_list, app.get_target_palette());
        }
        ui.refresh_ui();
    });
}

/* binding for all events specific to the history panel */
function bind_history_sidebar_events() {
    ui_cache.history_sidebar.querySelectorAll('[data-tooltip]').forEach(el => ui.bind_tooltip(ui_cache.history_tooltip, el, 'middle', 'left'));
    ui_cache.history_sidebar.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        const action = e.target.dataset.action;
        if (tab) {
            const panel = ui_cache.history_sidebar.querySelector('#' + tab.dataset.panel);
            sidebar_actions[action]?.(ui_cache.history_sidebar, tab, panel);
        } else if (action) {
            sidebar_actions[action]?.(e);
        }
    });
}

/* binding for all events tied to keyboard shortcuts */
function bind_keyboard_events() {
    document.addEventListener("keydown", (e) => {
        if (e.target.matches("input, textarea, select") || e.target.isContentEditable) return;
        const shortcut = shortcut_name(e);
        if (!keyboard_shortcuts[shortcut]) return;
        e.preventDefault();
        keyboard_shortcuts[shortcut]();
    });
}

/* binding for all events specific to the sidebar */
function bind_palette_sidebar_events() {
    ui_cache.palette_sidebar.querySelectorAll('[data-tooltip]').forEach(el => ui.bind_tooltip(ui_cache.palette_tooltip, el));
    ui_cache.palette_sidebar.querySelector('#mapping_method').addEventListener('change', (e) => {
        app.set_mapping_method(e.target.value);
        ui.refresh_ui(); 
    });
    ui_cache.palette_sidebar.querySelector('.palette_row_container').addEventListener('pointerover', (e) => {
        const source_row = e.target.closest('.source_color');
        if (!source_row) return;
        const source_hex = source_row.parentNode.dataset.source;
        ui.highlight_color(app.get_base_image_cache(), ui_cache.highlight_canvas, ui_cache.highlight_ctx, source_hex);
    });
    ui_cache.palette_sidebar.querySelector('.palette_row_container').addEventListener('pointerout', (e) => {
        const source_row = e.target.closest('.source_color');
        if (!source_row) return;
        ui.clear_highlights(ui_cache.highlight_canvas, ui_cache.highlight_ctx);
    });
    ui_cache.palette_sidebar.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        const action = e.target.dataset.action;
        if(tab) {
            const panel = ui_cache.palette_sidebar.querySelector('#' + tab.dataset.panel);
            sidebar_actions[action]?.(ui_cache.palette_sidebar, tab, panel);
        } else {
            sidebar_actions[action]?.(e);
        }
    });
    ui_cache.palette_sidebar.querySelectorAll(".palette_container").forEach(container => {
        container.addEventListener('pointerover', (e) => {
            const swatch = e.target.closest('.palette_grid .swatch');
            if (!swatch) return;
            if (swatch.contains(e.relatedTarget)) return;
            const hex = swatch.dataset.hex;
            const container = swatch.closest('.palette_container').querySelector('.palette_hex_container');
            ui.display_palette_hex(hex, container);
        });
    });
    ui_cache.palette_select_list.addEventListener('click', (e) => ui.set_custom_color(e.target, ui_cache.palette_select_list, ui_cache.palette_row_container));
}

/* binding for all events specific to the toolbar */
function bind_toolbar_events() {
    const toolbar = ui_cache.toolbar;
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
        const target = e.target;
        const action = target.dataset.action;
        if(target.getAttribute('aria-haspopup') === 'true') {
            const menu = target.nextElementSibling;
            const was_open = menu.classList.contains('open');
            ui.hide_toolbar_menus(toolbar);
            if(!was_open) {
                menu.classList.add("open");
                target.setAttribute("aria-expanded", "true");
            }
        }
        if(action) {
            toolbar_actions[action]?.();
            ui.hide_toolbar_menus(toolbar);
        }
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