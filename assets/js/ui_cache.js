export const ui_cache = {
    canvas: null,
    color_map: null,
    palette_container: null,
    palette_row_prime: null,
    palette_selector: null,
    sidebar: null,
    toolbar: null,
    tooltip: null,
    zoom: null,
}

export function ui_cache_init() {
    ui_cache.canvas = document.getElementById('preview_canvas');
    ui_cache.ctx = ui_cache.canvas.getContext('2d', { willReadFrequently: true });
    ui_cache.color_map = document.getElementById('color_map_block');
    ui_cache.palette_container = document.getElementById('palette_container');
    ui_cache.palette_selector = document.getElementById('target_hex_select_list');
    ui_cache.palette_row_prime = document.getElementById('palette_row_prime');
    ui_cache.sidebar = document.getElementById('sidebar');
    ui_cache.toolbar = document.getElementById('toolbar');
    ui_cache.tooltip = document.getElementById('tooltip');
    ui_cache.zoom = document.getElementById('zoom_block');
}