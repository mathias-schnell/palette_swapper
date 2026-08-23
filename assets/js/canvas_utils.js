/*
    * canvas_utils.js
    * This file contains functions for manipulation of the canvas element and its context.
*/

import * as app from "./app.js";
import * as image from "./image_utils.js";
import { ui_cache } from "./ui_cache.js";

let render_scheduled = false;
const transform_order = {
    rotate: rotate,
    flip_horizontal: flip_horizontal,
    flip_vertical: flip_vertical
};

/* master function that refreshes the canvas and applies all relevant operations and transforms */
export function render() {
    if(render_scheduled) return;
    render_scheduled = true;

    requestAnimationFrame(() => {
        const state = build_state(ui_cache.canvas_container, ui_cache.ctx);
        if(validate_state(state)) {
            prepare_canvas(state);
            state.ctx.save();
            apply_transforms(state);
            draw_scene(state);
            state.ctx.restore();

            const base_data = state.ctx.getImageData(0, 0, state.width, state.height);
            app.set_base_image_cache(new Uint32Array(base_data.data.buffer));
            
            apply_effects(state);
        }
        render_scheduled = false;
    });
}

/* a function that applies all transformations in the order defined by transform_order */
function apply_transforms(state) {
    for (const [key, func] of Object.entries(transform_order)) {
        if (state.transforms.get(key)) {
            func(state);
        }
    }
}

/* a function for building the state object that holds all data about the canvas's current state */
function build_state(container, ctx) {
    const state = {
        source          : app.get_source(),
        mapping         : app.get_mapping(),
        transforms      : app.get_transforms(),
        container       : container,
        ctx             : ctx,
    };
    const zoom = state.transforms.get('zoom') ?? 1;
    const rotation = state.transforms.get('rotate') ?? 0;
    const rotated = rotation % 180 === 90;
    const width = rotated ? state.source.image.naturalHeight * zoom : state.source.image.naturalWidth * zoom;
    const height = rotated ? state.source.image.naturalWidth * zoom : state.source.image.naturalHeight * zoom;

    state.zoom = zoom;
    state.rotation = rotation;
    state.rotated = rotated;
    state.width = width;
    state.height = height;

    return state;
}

/* a function that checks whether the state is valid */
function validate_state(state) {
    if(!state.container || !state.ctx || !state.source.image || state.width <= 0 || state.height <= 0) return false;
    return true;
}

/* a function that sets the canvas to the appropriate size and settings before drawing anything */
function prepare_canvas(state) {
    resize(state);
    state.ctx.setTransform(1, 0, 0, 1, 0, 0);
    state.ctx.imageSmoothingEnabled = false;
    clear(state);
}

/* a function for drawing the initial content to the canvas */
function draw_scene(state) {
    draw_source(state);
}

/* functions that apply transformations to the canvas context */
function flip_horizontal(state) {
    if (!state.transforms.get('flip_horizontal')) return;
    state.ctx.translate(state.width, 0);
    state.ctx.scale(-1, 1);
}

function flip_vertical(state) {
    if (!state.transforms.get('flip_vertical')) return;
    state.ctx.translate(0, state.height);
    state.ctx.scale(1, -1);
}

function rotate(state) {
    if (state.rotation === 0) return;
    if (state.rotation === 90 || state.rotation === -270) {
        state.ctx.translate(state.width, 0);
        state.ctx.rotate(Math.PI / 2);
    } else if (state.rotation === -90 || state.rotation === 270) {
        state.ctx.translate(0, state.height);
        state.ctx.rotate(-Math.PI / 2);
    } else if (state.rotation === 180 || state.rotation === -180) {
        state.ctx.translate(state.width, state.height);
        state.ctx.rotate(Math.PI);
    }
}

/* functions that help other functions with canvas operations */
function resize(state) {
    [...state.container.children].forEach(child => {
        child.height = state.height;
        child.width = state.width;
    });
    state.container.style.height = state.height + 'px';
    state.container.style.width = state.width + 'px';
}

/* functions that draw to the canvas */
function apply_color_map(state) {
    const image_data = state.ctx.getImageData(0, 0, state.width, state.height);
    const uint32_palette = (state.mapping.method === "custom" ? state.mapping.custom_uint32 : state.mapping.colors_uint32);
    image.apply_palette(new Uint32Array(image_data.data.buffer), uint32_palette);
    state.ctx.putImageData(image_data, 0, 0);
}

function apply_effects(state) {
    apply_color_map(state);
}

function clear(state) {
    state.ctx.clearRect(0, 0, state.width, state.height);
}

function draw_source(state) {
    if (!state.source.image) return;
    state.ctx.drawImage(state.source.image, 0, 0, state.source.image.naturalWidth * state.zoom, state.source.image.naturalHeight * state.zoom);
}