/*
    * ui_utils.js
    * This file contains functions for UI manipulation and communication between UI and app state.
*/

import * as app from "./app.js";
import * as canvas from "./canvas_utils.js";
import * as color from "./color_utils.js";
import * as image from "./image_utils.js";
import { ui_cache } from "./ui_cache.js";

export function zoom_image(delta) {
    app.get_transforms()['zoom'] ? app.set_transform('zoom', app.get_transforms()['zoom'] + delta) : app.set_transform('zoom', 1.00 + delta);
    update_scale_ui(delta);
    canvas.render();
}

export function flip_image_horizontal() {
    app.get_transforms()['flip_horizontal'] ? app.set_transform('flip_horizontal', !app.get_transforms()['flip_horizontal']) : app.set_transform('flip_horizontal', true);
    canvas.render();
}

export function flip_image_vertical() {
    app.get_transforms()['flip_vertical'] ? app.set_transform('flip_vertical', !app.get_transforms()['flip_vertical']) : app.set_transform('flip_vertical', true);
    canvas.render();
}

export function rotate_image(degrees) {
    app.get_transforms()['rotate'] ? app.set_transform('rotate', app.get_transforms()['rotate'] + degrees) : app.set_transform('rotate', degrees);
    canvas.render();
}

export function activate_toolbar_menus() {
    ui_cache.toolbar.querySelectorAll("[aria-disabled='true']").forEach((el) => {
        el.ariaDisabled = false;
    });
}

export function change_swatch_color(swatch_row, target_hex) {
    swatch_row.dataset.target = target_hex;
    swatch_row.querySelector('.target_swatch').style.background = `#${target_hex}`;
    swatch_row.querySelector('.target_hex').textContent = `#${target_hex}`;
}

export function close_all_menus() {
    document.querySelectorAll('.toolbar_menu').forEach(menu => menu.classList.remove('open'));
}

export function close_sidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.querySelectorAll('.sidebar_panel').forEach(
        panel => panel.classList.remove('open')
    );
}

export function open_menu(menu_id) {
    document.getElementById(menu_id).classList.add('open');
}

export function open_sidebar(panel_id) {
    document.getElementById('sidebar').classList.add('open');
    const panels = document.querySelectorAll('.sidebar_panel');
    const target = document.getElementById(panel_id);
    panels.forEach(panel => panel.classList.remove('open'));
    target.classList.add('open');
}

export function populate_palette_selector() {
    ui_cache.palette_selector.replaceChildren();
    const target_palette = app.get_target().palette;
    const colors = target_palette.keys();
    const size = Math.max(1, Math.ceil(Math.sqrt(target_palette.size)));
    ui_cache.palette_selector.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    colors.forEach((hex) => {
        const swatch = document.createElement("span");
        swatch.classList.add("swatch");
        swatch.dataset.target = hex;
        swatch.style.backgroundColor = `#${hex}`;
        ui_cache.palette_selector.appendChild(swatch);
    })
}

export function position_floating_element(anchor, float_el, anchor_pt = 'middle', settings = app.tooltip_config) {
    const rect = anchor.getBoundingClientRect();
    const el_rect = float_el.getBoundingClientRect();
    let top;
    switch(anchor_pt) {
        case 'top': top = rect.top; break;
        case 'bottom': top = rect.bottom - el_rect.height; break;
        default: top = rect.top + (rect.height / 2) - (el_rect.height / 2);
    }
    let left = rect.right + settings.offset_x;
    [left, top] = clamp_to_viewport(left, top, el_rect, window.innerWidth, window.innerHeight);
    float_el.style.left = `${left}px`;
    float_el.style.top = `${top}px`;
}

export function toggle_floating_element(float_el, force_hide = false, force_show = false) {
    if(force_hide) {
        float_el.classList.add('hidden');
        float_el.classList.remove('visible');
    } else if(force_show) {
        float_el.classList.remove('hidden');
        float_el.classList.add('visible');
    } else {
        float_el.classList.toggle('hidden');
        float_el.classList.toggle('visible');
    }
}

export function refresh_ui(skip_upm = false, skip_pps = false, skip_rp = false, skip_rc = false) {
    if (!skip_upm) update_palette_map();
    if (!skip_pps) populate_palette_selector();
    if (!skip_rp) redraw_palette();
    if (!skip_rc) canvas.render();
}

export function redraw_palette() {
    const colors = (app.get_mapping().method === "custom" ? app.get_mapping().custom : app.get_mapping().colors);
    ui_cache.palette_container.querySelectorAll('.palette_row:not(#palette_row_prime)').forEach(el => el.remove());
    colors.forEach((tar_hex, source_hex) => {
        const row = ui_cache.palette_row_prime.cloneNode(true);
        row.removeAttribute('id');
        row.classList.toggle("custom_mode", app.get_mapping().method === "custom");
        row.dataset.source = source_hex;
        row.dataset.target = tar_hex;
        row.querySelector('.source_swatch').style.background = `#${source_hex}`;
        row.querySelector('.target_swatch').style.background = `#${tar_hex}`;
        row.querySelector('.source_hex').textContent = `#${source_hex}`;
        row.querySelector('.target_hex').textContent = `#${tar_hex}`;
        if (app.get_mapping().locked.get(source_hex)) {
            row.querySelector('.lock_button').classList.toggle('locked', true);
            row.querySelector('.lock_button').classList.toggle('unlocked', false);
        }
        ui_cache.palette_container.appendChild(row);
    });
}

export function update_palette_map() {
    const method = ui_cache.color_map.querySelector("#color_map_method").value;
    const locked = app.get_mapping().locked;
    const new_map = color.generate_palette_map(app.get_source().palette, app.get_target().palette, method);
    let colors = app.get_mapping().colors;
    let custom = app.get_mapping().custom;
    
    if (custom.size === 0) {
        custom = structuredClone(colors);
    }
    for (const key of new_map.keys()) {
        if(locked.has(key)) {
            new_map.set(key, locked.get(key));
            custom.set(key, locked.get(key));
        }
    }
    colors = new_map;
    app.update_mapping({colors: colors, custom: custom, method: method});
}

function clamp_to_viewport(x, y, el_rect, vw, vh) {
    const clampedX = Math.max(5, Math.min(x, vw - el_rect.width - 5));
    const clampedY = Math.max(5, Math.min(y, vh - el_rect.height - 5));
    return [clampedX, clampedY];
}

function update_scale_ui(delta) {
    const zoom_val = parseFloat(ui_cache.zoom.querySelector("#zoom_input").value) + delta;
    ui_cache.zoom.querySelector("#zoom_input").value = zoom_val.toFixed(2);
}
