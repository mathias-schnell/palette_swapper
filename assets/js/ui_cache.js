/*
    * ui_cache.js
    * This file contains the UI cache and functions for managing it.
*/

/* the ui_cache object stores references to frequently accessed DOM elements */
export const ui_cache = {
    body: null,
    canvas: null,
    color_map: null,
    ctx: null,
    history: null,
    history_tooltip: null,
    palette_container: null,
    palette_row_prime: null,
    palette_selector: null,
    sidebar: null,
    sidebar_tooltip: null,
    toolbar: null,
    zoom: null,
}

/* initialize the ui_cache by selecting and storing references to DOM elements */
export function ui_cache_init() {
    ui_cache.body = document.getElementsByTagName('body')[0];
    ui_cache.canvas = document.getElementById('preview_canvas');
    ui_cache.color_map = document.getElementById('color_map_block');
    ui_cache.ctx = ui_cache.canvas.getContext('2d', { willReadFrequently: true });
    ui_cache.history = document.getElementById('history');
    ui_cache.history_tooltip = document.getElementById('history_tooltip');
    ui_cache.palette_container = document.getElementById('palette_container');
    ui_cache.palette_row_prime = document.getElementById('palette_row_prime');
    ui_cache.palette_selector = document.getElementById('target_hex_select_list');
    ui_cache.sidebar = document.getElementById('sidebar');
    ui_cache.sidebar_tooltip = document.getElementById('sidebar_tooltip');
    ui_cache.toolbar = document.getElementById('toolbar');
    ui_cache.tooltip = document.getElementById('tooltip');
    ui_cache.zoom = document.getElementById('zoom_block');
}