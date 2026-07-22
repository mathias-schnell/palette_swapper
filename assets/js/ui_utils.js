/*
    * ui_utils.js
    * This file contains functions for UI manipulation and communication between UI and app state.
*/

import * as app from "./app.js";
import * as color from "./color_utils.js";
import * as image from "./image_utils.js";
import { ui_cache } from "./ui_cache.js";

export function adjust_scale(delta) {
    app.update_settings({zoom: (Math.max(1.00, Math.min(5.00, app.get_settings().zoom + delta))) });
    update_scale_ui();
    resize_canvas();
    redraw_preview();
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
    close_all_menus();
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
    const colors = Object.keys(app.get_target().palette);
    const size = Math.max(1, Math.ceil(Math.sqrt(colors.length)));
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
    if (!skip_rc) redraw_preview();
}

export function redraw_palette() {
    const colors = (app.get_mapping().method === "custom" ? app.get_mapping().custom : app.get_mapping().colors);
    ui_cache.palette_container.querySelectorAll('.palette_row:not(#palette_row_prime)').forEach(el => el.remove());
    Object.entries(colors).forEach(([source_hex, target_hex]) => {
        const row = ui_cache.palette_row_prime.cloneNode(true);
        row.removeAttribute('id');
        row.classList.toggle("custom_mode", app.get_mapping().method === "custom");
        row.dataset.source = source_hex;
        row.dataset.target = target_hex;
        row.querySelector('.source_swatch').style.background = `#${source_hex}`;
        row.querySelector('.target_swatch').style.background = `#${target_hex}`;
        row.querySelector('.source_hex').textContent = `#${source_hex}`;
        row.querySelector('.target_hex').textContent = `#${target_hex}`;
        if (app.get_mapping().locked[source_hex]) {
            row.querySelector('.lock_button').classList.toggle('locked', true);
            row.querySelector('.lock_button').classList.toggle('unlocked', false);
        }
        ui_cache.palette_container.appendChild(row);
    });
}

export function redraw_preview() {
    const canvas = ui_cache.canvas;
    const ctx = ui_cache.ctx;
    const source = app.get_source();
    const mapping = app.get_mapping();
    if (!canvas || !ctx || !source.image) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source.image, 0, 0, source.image.naturalWidth, source.image.naturalHeight, 0, 0, canvas.width, canvas.height);
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    image.apply_palette(image_data, (mapping.method === "custom" ? mapping.custom : mapping.colors));
    ctx.putImageData(image_data, 0, 0);
}

export function rotate_image(degrees) {
    const source = app.get_source();
    if (!source.image) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (degrees === 90 || degrees === -270) {
        canvas.width = source.image.naturalHeight;
        canvas.height = source.image.naturalWidth;
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI / 2);
    } else if (degrees === -90 || degrees === 270) {
        canvas.width = source.image.naturalHeight;
        canvas.height = source.image.naturalWidth;
        ctx.translate(0, canvas.height);
        ctx.rotate(-Math.PI / 2);
    } else if (degrees === 180 || degrees === -180) {
        canvas.width = source.image.naturalWidth;
        canvas.height = source.image.naturalHeight;
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate(Math.PI);
    } else {
        console.error("Invalid rotation angle. Must be 90, -90, 180, or -180.");
        return;
    }
    ctx.drawImage(source.image, 0, 0);
    const rotated_image = new Image();
    rotated_image.onload = () => {
        source.image = rotated_image;
        source.palette = image.extract_palette(rotated_image);
        app.update_source(source);
        [ui_cache.canvas.width, ui_cache.canvas.height] = [rotated_image.naturalWidth * app.get_settings().zoom, rotated_image.naturalHeight * app.get_settings().zoom];
        redraw_preview();
    };
    rotated_image.src = canvas.toDataURL("image/png");
}

export function update_palette_map() {
    const method = ui_cache.color_map.querySelector("#color_map_method").value;
    const locked = app.get_mapping().locked;
    const new_map = color.generate_palette_map(app.get_source().palette, app.get_target().palette, method);
    let colors = app.get_mapping().colors;
    let custom = app.get_mapping().custom;
    
    if (Object.keys(custom).length === 0) {
        custom = structuredClone(colors);
    }
    Object.entries(new_map).forEach(([source_hex, target_hex]) => {
        if (locked[source_hex]) {
            new_map[source_hex] = locked[source_hex];
            custom[source_hex] = locked[source_hex];
        }
    });
    colors = new_map;
    app.update_mapping({colors: colors, custom: custom, method: method});
}

function clamp_to_viewport(x, y, el_rect, vw, vh) {
    const clampedX = Math.max(5, Math.min(x, vw - el_rect.width - 5));
    const clampedY = Math.max(5, Math.min(y, vh - el_rect.height - 5));
    return [clampedX, clampedY];
}

function resize_canvas() {
    ui_cache.canvas.width = app.get_source().image.naturalWidth * app.get_settings().zoom;
    ui_cache.canvas.height = app.get_source().image.naturalHeight * app.get_settings().zoom;
}

function update_scale_ui() {
    ui_cache.zoom.querySelector("#zoom_input").value = app.get_settings().zoom.toFixed(2);
}
