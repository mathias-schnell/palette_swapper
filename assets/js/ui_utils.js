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
    console.log(swatch_row);
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

export function hide_palette_selector(palette_selector) {
    palette_selector.classList.add('hidden');
    palette_selector.classList.remove('visible');
}

export function open_palette_selector(palette_selector) {
    palette_selector.classList.add('visible');
    palette_selector.classList.remove('hidden');
}

export function position_palette_selector(element, palette_selector) {
    const rect = element.getBoundingClientRect();
    palette_selector.style.left = `${rect.right + app.tooltip.offset_x}px`;
    palette_selector.style.top = `${rect.top + (rect.height / 2) + app.tooltip.offset_y}px`;
    palette_selector.style.transform = 'translateY(-50%)';
}

export function position_tooltip(element) {
    const rect = element.getBoundingClientRect();
    app.ui.tooltip.style.left = `${rect.right + app.tooltip.offset_x}px`;
    app.ui.tooltip.style.top = `${rect.top + (rect.height / 2) + app.tooltip.offset_y}px`;
    app.ui.tooltip.style.transform = 'translateY(-50%)';
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
