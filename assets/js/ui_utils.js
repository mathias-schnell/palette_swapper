/*
    * ui_utils.js
    * This file contains functions for UI manipulation and communication between UI and app state.
*/

import * as app from "./app.js";
import * as canvas from "./canvas_utils.js";
import * as color from "./color_utils.js";
import * as image from "./image_utils.js";
import { ui_cache } from "./ui_cache.js";

const formatters = {
    flip_horizontal     : (action) => format_action_flip_horizontal(action),
    flip_vertical       : (action) => format_action_flip_vertical(action),
    rotate              : (action) => format_action_rotate(action),
    zoom                : (action) => format_action_zoom(action),
}

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
    if(!e.target.closest('#palette_select_list') && !e.target.closest('.palette_select_button')) { 
        toggle_palette_selector(null, true);
    }
}

export function hide_toolbar_menus(e, toolbar) {
    toolbar.querySelectorAll('.toolbar_menu.open').forEach(menu => {
        menu.classList.remove('open');
        const button = menu.previousElementSibling;
        button?.setAttribute('aria-expanded', 'false');
    });
}

export function lock_color(e) {
    e.target.classList.toggle('locked');
    e.target.classList.toggle('unlocked');

    const source = e.target.closest("[data-source]").dataset.source;
    if(e.target.classList.contains('locked')) {
        const target = e.target.closest("[data-target]").dataset.target;
        app.create_lock(source, target);
    } else {
        app.remove_lock(source);
    }
}

export function toggle_panel(sidebar, tab, panel) {
    const was_open = tab.classList.contains('open');
    
    sidebar.querySelectorAll('.tab.open, .panel.open').forEach((e) => {
        e.classList.remove('open');
    });
    sidebar.classList.toggle('open', !was_open);
    
    if(!was_open) {
        panel.classList.add('open');
        tab.classList.add('open');
    }
}

export function toggle_panel_from_toolbar(e) {
    const panel = "[data-panel='" + e.target.dataset.action.replace("show_", "") + "']";
    console.log(panel);
    document.querySelector(panel).click();
}

export function populate_palette_selector(palette_selector, palette) {
    palette_selector.replaceChildren();
    const colors = palette.keys();
    const size = Math.max(1, Math.ceil(Math.sqrt(palette.size)));
    palette_selector.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    colors.forEach((hex) => {
        const swatch = document.createElement("span");
        swatch.classList.add("swatch");
        swatch.dataset.target = hex;
        swatch.style.backgroundColor = `#${hex}`;
        palette_selector.appendChild(swatch);
    })
}

export function draw_palette_in_panel(panel, palette) {
    const palette_container = panel.querySelector(".palette_container");
    const grid_container = document.createElement("div");
    const hex_container = document.createElement("div");
    const hex_text = document.createElement("span"); 
    const colors = palette.keys();

    hex_text.classList.add("palette_hex");
    hex_text.textContent = `#FFFFFF`;
    hex_container.classList.add("palette_hex_container");
    hex_container.appendChild(hex_text);
    grid_container.classList.add("palette_grid");

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

    palette_container.replaceChildren();
    palette_container.classList.add("palette_window");
    palette_container.appendChild(hex_container);
    palette_container.appendChild(grid_container);
}

export function set_custom_color(swatch) {
    if(!swatch.matches('.swatch')) return;
    const source = ui_cache.palette_select_list.dataset.source;
    const id = ui_cache.palette_select_list.getAttribute('id');
    const row = document.querySelector(`[data-source*='${source}']:not(#${id})`);
    const custom = app.get_mapping_custom();
    custom.set(ui_cache.palette_select_list.dataset.source, swatch.dataset.target);
    const custom_uint32 = image.palette_to_uint32(custom);
    change_swatch_color(row, swatch.dataset.target);
    toggle_floating_element(ui_cache.palette_select_list);
    app.set_mapping_custom(custom);
    app.set_mapping_custom_uint32(custom_uint32);
    refresh_ui();
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

export function refresh_ui() {
    image.update_palette_mapping();
    refresh_palette_sidebar(ui_cache.palette_sidebar, ui_cache.palette_row_container, ui_cache.palette_row_prime);
    refresh_history_sidebar(ui_cache.history_sidebar);
    canvas.render();
}

export function refresh_palette_sidebar(sidebar, palette_row_container, palette_row_template) {
    const method = app.get_mapping_method();
    const locked_colors = app.get_mapping_locked();
    const colors = (method === 'custom' ? app.get_mapping_custom() : app.get_mapping_colors());
    sidebar.querySelector('#mapping_method').value = method;
    palette_row_container.querySelectorAll('.palette_row:not(#palette_row_prime)').forEach(el => el.remove());
    colors.forEach((tar_hex, source_hex) => {
        const row = palette_row_template.cloneNode(true);
        row.removeAttribute('id');
        row.classList.toggle("custom_mode", method === "custom");
        row.dataset.source = source_hex;
        row.dataset.target = tar_hex;
        row.querySelector('.source_swatch').style.background = `#${source_hex}`;
        row.querySelector('.target_swatch').style.background = `#${tar_hex}`;
        row.querySelector('.source_hex').textContent = `#${source_hex}`;
        row.querySelector('.target_hex').textContent = `#${tar_hex}`;
        if (locked_colors.get(source_hex)) {
            row.querySelector('.lock_button').classList.toggle('locked', true);
            row.querySelector('.lock_button').classList.toggle('unlocked', false);
        }
        palette_row_container.appendChild(row);
    });
}

function format_action_flip_horizontal(action) {
    return "Flip Horizontal";
}

function format_action_flip_vertical(action) {
    return "Flip Vertical";
}

function format_action_rotate(action) {
    if(action.value < 0) return "Rotate " + Math.abs(action.value) + "&deg; Counterclockwise";
    else return "Rotate " + Math.abs(action.value) + "&deg; Clockwise";
}

function format_action_zoom(action) {
    if(action.value < 0) return "Zoom Out " + (Math.abs(action.value) * 100) + "%";
    else return "Zoom In " + (Math.abs(action.value) * 100) + "%";
}

function refresh_history_sidebar(sidebar) {
    const history_actions = app.get_history_actions();
    const current = app.get_history_current();
    const history_list = sidebar.querySelector('#history_list');
    history_list.replaceChildren();
    history_actions.forEach((action, index) => {
        const li = document.createElement('li');
        const remove_btn = document.createElement('span');
        remove_btn.dataset.action = "remove_history";
        remove_btn.dataset.index = index;
        remove_btn.classList.add('remove_history');
        remove_btn.innerHTML = '&#120;';
        li.dataset.action = action.type;
        li.innerHTML = formatters[action.type]?.(action);
        li.appendChild(remove_btn);
        if (index > current) {
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