/*
    * ui_cache.js
    * This file contains the UI cache and functions for managing it.
*/

/* the ui_cache object stores references to frequently accessed DOM elements */
export const ui_cache = {
    body: null,
    canvas: null,
    ctx: null,
    history_sidebar: null,
    history_tooltip: null,
    mapping_method: null,
    palette_row_container: null,
    palette_row_prime: null,
    palette_selector: null,
    palette_sidebar: null,
    palette_tooltip: null,
    toolbar: null,
}

/* initialize the ui_cache by selecting and storing references to DOM elements */
export function ui_cache_init() {
    ui_cache.body = document.getElementsByTagName('body')[0];
    ui_cache.canvas = document.getElementById('preview_canvas');
    ui_cache.ctx = ui_cache.canvas.getContext('2d', { willReadFrequently: true });
    ui_cache.history_sidebar = document.getElementById('history_sidebar');
    ui_cache.history_tooltip = document.getElementById('history_tooltip');
    ui_cache.mapping_method = document.getElementById('mapping_method');
    ui_cache.palette_row_container = document.getElementById('palette_row_container');
    ui_cache.palette_row_prime = document.getElementById('palette_row_prime');
    ui_cache.palette_select_list = document.getElementById('palette_select_list');
    ui_cache.palette_sidebar = document.getElementById('palette_sidebar');
    ui_cache.palette_tooltip = document.getElementById('palette_tooltip');
    ui_cache.toolbar = document.getElementById('toolbar');
}