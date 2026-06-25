import { app } from "./app.js";
import * as color from "./color_utils.js"
import * as image from "./image_utils.js"

export function adjust_scale(delta) {
    calc_and_update_scale(delta);
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

export function position_floating_element(anchor, float_el, anchor_pt = 'middle', settings = app.tooltip) {
    const rect = anchor.getBoundingClientRect();
    const el_rect = float_el.getBoundingClientRect();
    let top;
    switch(anchor_pt) {
        case 'top': top = rect.top; break;
        case 'bottom': top = rect.bottom - el_rect.height; break;
        default: top = rect.top + (rect.height / 2) - (el_rect.height / 2);
    }
    float_el.style.left = `${rect.right + settings.offset_x}px`;
    float_el.style.top = `${top}px`;
    clamp_to_viewport(float_el, window.innerWidth, window.innerHeight);
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

export function redraw_palette() {
    if (!Object.keys(app.source.palette).length) return;
    if (!Object.keys(app.target.palette).length) return;
    let colors = null;
    if (app.mapping.method === "custom") {
        if(!app.mapping.custom) app.mapping.custom = color.generate_palette_map(app.source.palette, app.target.palette, "oklab");
        colors = app.mapping.custom;
    } else {
        colors = color.generate_palette_map(app.source.palette, app.target.palette, app.mapping.method);
    }
    const container = document.getElementById('palette_container');
    const template = document.getElementById('palette_row_prime');
    container.querySelectorAll('.palette_row:not(#palette_row_prime)').forEach(el => el.remove());
    Object.entries(colors).forEach(([source_hex, target_hex]) => {
        const row = template.cloneNode(true);
        row.removeAttribute('id');
        row.style.display = 'block';
        row.classList.toggle("custom_mode", app.mapping.method === "custom")
        row.dataset.source = source_hex;
        row.dataset.target = target_hex;
        row.querySelector('.source_swatch').style.background = `#${source_hex}`;
        row.querySelector('.target_swatch').style.background = `#${target_hex}`;
        row.querySelector('.source_hex').textContent = `#${source_hex}`;
        row.querySelector('.target_hex').textContent = `#${target_hex}`;
        container.appendChild(row);
    });
}

export function redraw_preview() {
    const { ctx, element } = app.canvas;
    const img = app.source.image;
    const colors = (app.mapping.method === "custom" ? app.mapping.custom : app.mapping.colors);
    if (!ctx || !element || !img) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, element.width, element.height);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, element.width, element.height);
    const image_data = ctx.getImageData(0, 0, element.width, element.height);
    image.apply_palette(image_data, colors);
    ctx.putImageData(image_data, 0, 0);
}

export function update_palette_map() {
    app.mapping.method = app.ui.color_map_method.value;
    app.mapping.colors = color.generate_palette_map(app.source.palette, app.target.palette, app.mapping.method);
    redraw_palette();
}

function calc_and_update_scale(delta) {
    app.settings.scale = (Math.max(1.00, Math.min(5.00, app.settings.scale + delta)));
}

function clamp_to_viewport(float_el, vw, vh) {
    const el_rect = float_el.getBoundingClientRect();
    const top = parseFloat(float_el.style.top) || 0;
    const left = parseFloat(float_el.style.left) || 0;
    float_el.style.top = `${Math.max(5, Math.min(top, vh - el_rect.height - 5))}px`;
    float_el.style.left = `${Math.max(5, Math.min(left, vw - el_rect.width - 5))}px`;
}

function resize_canvas() {
    app.canvas.element.width = app.source.image.naturalWidth * app.settings.scale;
    app.canvas.element.height = app.source.image.naturalHeight * app.settings.scale;
}

function reset_color_map() {
    Object.keys(app.mapping.colors).forEach(
        item => app.mapping.colors[item] = item
    );
    redraw_palette();
    redraw_preview();
}

function update_scale_ui() {
    app.ui.scale_input.value = app.settings.scale.toFixed(2);
}
