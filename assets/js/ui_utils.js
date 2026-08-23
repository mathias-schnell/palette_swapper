/*
    * ui_utils.js
    * This file contains functions for UI manipulation and communication between UI and app state.
*/

import * as app from "./app.js";
import * as canvas from "./canvas_utils.js";
import * as color from "./color_utils.js";
import * as image from "./image_utils.js";
import { ui_cache } from "./ui_cache.js";

export function highlight_color(image_data, overlay_canvas, overlay_canvas_ctx, hex) {
    if (!image_data || image_data.length !== overlay_canvas.width * overlay_canvas.height) return;
    const brightness = color.calc_hex_brightness(hex);
    const highlight_color = (brightness >= 128) ? 0xFF000000 : 0xFFFFFFFF;
    const overlay_data = overlay_canvas_ctx.createImageData(overlay_canvas.width, overlay_canvas.height);
    const overlay_buffer = new Uint32Array(overlay_data.data.buffer);
    const target_int = color.hex_to_uint32(hex);

    for (let i = 0; i < image_data.length; i++) {
        if (image_data[i] === target_int) {
            overlay_buffer[i] = highlight_color;
        }
    }
    overlay_canvas_ctx.putImageData(overlay_data, 0, 0);
    overlay_canvas.classList.add('pulse');
}

export function clear_highlights(overlay_canvas, overlay_canvas_ctx) {
    overlay_canvas_ctx.clearRect(0, 0, overlay_canvas.width, overlay_canvas.height);
    overlay_canvas.classList.remove('pulse');
}

export function zoom_image(delta) {
    app.add_to_history({label: 'Zoom', type: 'zoom', value: delta, timestamp: Date.now()});
}

export function flip_image_horizontal() {
    app.add_to_history({label: 'Flip Horizontal', type: 'flip_horizontal', value: true, timestamp: Date.now()});
}

export function flip_image_vertical() {
    app.add_to_history({label: 'Flip Vertical', type: 'flip_vertical', value: true, timestamp: Date.now()});
}

export function rotate_image(degrees) {
    app.add_to_history({label: 'Rotate', type: 'rotate', value: degrees, timestamp: Date.now()});
}

export function bind_tooltip(tooltip, el, anchor_pt, placement, settings = app.tooltip_config) {
    el.addEventListener('mouseenter', (e) => {
        tooltip.textContent = e.target.dataset.tooltip;
        position_floating_element(e.target, tooltip, anchor_pt, placement, settings);
        toggle_floating_element(tooltip);
    });
    el.addEventListener('mouseleave', (e) => {
        toggle_floating_element(tooltip, true);
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

export function enable_toolbar_items(toolbar, items) {
    Object.values(items).forEach((id) => {
        let el = toolbar.querySelector(`#${id}`);
        while (el && el != toolbar) {
            el.disabled = false;
            el.ariaDisabled = "false";
            el = el.parentElement.closest(".toolbar_item");
        }
    });
}

export function hide_floating_elements(e) {
    close_all_menus();
    if(!e.target.closest('#palette_select_list') && !e.target.closest('.palette_select_button')) { 
        toggle_palette_selector(null, true);
    }
}

export function lock_color(e) {
    e.target.classList.toggle('locked');
    e.target.classList.toggle('unlocked');

    const source = e.target.closest("[data-source]").dataset.source;
    if(e.target.classList.contains('locked')) {
        const target = e.target.closest("[data-target]").dataset.target;
        app.set_lock(source, target);
    } else {
        app.remove_lock(source);
    }
}

export function toggle_sidebar(sidebar, tab, panel_id) {
    const panel = document.getElementById(panel_id);
    sidebar.classList.toggle('open');
    panel.classList.toggle('open');
    tab.classList.toggle('open');
}

export function populate_palette_selector(palette_selector) {
    palette_selector.replaceChildren();
    const target_palette = app.get_target().palette;
    const colors = target_palette.keys();
    const size = Math.max(1, Math.ceil(Math.sqrt(target_palette.size)));
    palette_selector.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    colors.forEach((hex) => {
        const swatch = document.createElement("span");
        swatch.classList.add("swatch");
        swatch.dataset.target = hex;
        swatch.style.backgroundColor = `#${hex}`;
        palette_selector.appendChild(swatch);
    })
}

export function show_palette_window(palette) {
    const pal_window = document.createElement("div");
    const close_btn = document.createElement("button");
    const grid_container = document.createElement("div");
    const hex_container = document.createElement("div");
    const hex_text = document.createElement("span");
    const colors = palette.keys();
    const size = Math.max(1, Math.ceil(Math.sqrt(palette.size)));

    document.querySelector(".palette_window")?.remove();

    hex_text.classList.add("palette_hex");
    hex_text.textContent = `#FFFFFF`;
    hex_container.classList.add("palette_hex_container");
    hex_container.appendChild(hex_text);
    pal_window.classList.add("palette_window");
    pal_window.appendChild(hex_container);
    grid_container.classList.add("palette_grid");
    grid_container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    close_btn.classList.add("palette_close_btn");

    close_btn.innerHTML = "&times;";
    close_btn.addEventListener("click", () => {
        pal_window.remove();
    });
    pal_window.appendChild(close_btn);

    colors.forEach((hex) => {
        const swatch = document.createElement("span");
        swatch.classList.add("swatch");
        swatch.style.backgroundColor = `#${hex}`;
        swatch.addEventListener("mouseenter", () => {
            const bg = color.get_contrasting_hex_color(hex);
            hex_container.style.backgroundColor = `${bg}`
            hex_text.style.color = `#${hex}`;
            hex_text.style.opacity = 1;
            hex_text.textContent = `#${hex}`;
        });
        grid_container.appendChild(swatch);
    })

    pal_window.appendChild(grid_container);
    document.body.appendChild(pal_window);
}

export function set_custom_color(swatch) {
    if(!swatch.matches('.swatch')) return;
    const source = ui_cache.palette_select_list.dataset.source;
    const id = ui_cache.palette_select_list.getAttribute('id');
    const row = document.querySelector(`[data-source*='${source}']:not(#${id})`);
    const custom = app.get_mapping().custom;
    custom.set(ui_cache.palette_select_list.dataset.source, swatch.dataset.target);
    const custom_uint32 = image.palette_to_uint32(custom);
    change_swatch_color(row, swatch.dataset.target);
    toggle_floating_element(ui_cache.palette_select_list);
    app.set_mapping_custom(custom);
    app.set_mapping_custom_uint32(custom_uint32);
    refresh_ui(false, true, true, false, true);
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

export function toggle_palette_selector(el, force_hide = false, force_show = false) {
    if(el) {
        const source = el.closest("[data-source]")?.dataset.source;
        if(source) { ui_cache.palette_select_list.dataset.source = source; }
        if(!force_hide) { position_floating_element(el, ui_cache.palette_select_list, 'top'); }
    }
    toggle_floating_element(ui_cache.palette_select_list, force_hide, force_show);
    
}

export function refresh_ui(skip_upm = false, skip_pps = false, skip_rp = false, skip_rc = false, skip_rh = false) {
    if (!skip_upm) update_palette_map();
    if (!skip_pps) populate_palette_selector(ui_cache.palette_select_list);
    if (!skip_rp) redraw_palette(ui_cache.palette_row_container, ui_cache.palette_row_prime);
    if (!skip_rc) canvas.render();
    if (!skip_rh) refresh_history();
}

export function redraw_palette(palette_row_container, palette_row_template) {
    const colors = (app.get_mapping().method === "custom" ? app.get_mapping().custom : app.get_mapping().colors);
    palette_row_container.querySelectorAll('.palette_row:not(#palette_row_prime)').forEach(el => el.remove());
    colors.forEach((tar_hex, source_hex) => {
        const row = palette_row_template.cloneNode(true);
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
        palette_row_container.appendChild(row);
    });
}

export function update_palette_map() {
    const method = ui_cache.mapping_method.value;
    const locked = app.get_mapping().locked;
    const new_map = color.generate_palette_map(app.get_source().palette, app.get_target().palette, method);
    let colors = app.get_mapping().colors;
    let custom = app.get_mapping().custom;
    let colors_uint32 = app.get_mapping().colors_uint32;
    let custom_uint32 = app.get_mapping().custom_uint32;
    
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
    colors_uint32 = image.palette_to_uint32(new_map);
    custom_uint32 = image.palette_to_uint32(custom);
    app.update_mapping({colors: colors, colors_uint32: colors_uint32, custom: custom, custom_uint32: custom_uint32, method: method});
}

function refresh_history() {
    const history = app.get_history();
    const history_list = document.getElementById('history_list');
    history_list.replaceChildren();
    history.actions.forEach((action, index) => {
        const li = document.createElement('li');
        const remove_btn = document.createElement('span');
        remove_btn.dataset.action = "remove_history";
        remove_btn.dataset.index = index;
        remove_btn.classList.add('remove_history');
        remove_btn.innerHTML = "&#120;";
        li.dataset.action = action.type;
        li.textContent = `${action.label}: ${action.value}`;
        li.appendChild(remove_btn);
        if (index > history.current) {
            li.classList.add('inactive');
        } else {
            li.classList.add('active');
        }
        history_list.appendChild(li);
    });
}

function position_floating_element(anchor, float_el, anchor_pt = 'middle', placement = 'right', settings = app.tooltip_config) {
    const rect = anchor.getBoundingClientRect();
    const el_rect = float_el.getBoundingClientRect();
    let left, top;
    switch(anchor_pt) {
        case 'top': top = rect.top; break;
        case 'bottom': top = rect.bottom - el_rect.height; break;
        default: top = rect.top + (rect.height / 2) - (el_rect.height / 2);
    }
    switch(placement) {
        case 'left': left = rect.left - el_rect.width - settings.offset_x; break;
        default: left = rect.right + settings.offset_x;
    }
    [left, top] = clamp_to_viewport(left, top, el_rect, window.innerWidth, window.innerHeight);
    float_el.style.left = `${left}px`;
    float_el.style.top = `${top}px`;
}

function clamp_to_viewport(x, y, el_rect, vw, vh) {
    const clampedX = Math.max(5, Math.min(x, vw - el_rect.width - 5));
    const clampedY = Math.max(5, Math.min(y, vh - el_rect.height - 5));
    return [clampedX, clampedY];
}