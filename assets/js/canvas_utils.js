/*
    * canvas_utils.js
    * This file contains functions for manipulation of the canvas element and its context.
*/

import * as app from "./app.js";
import * as color from "./color_utils.js";
import * as image from "./image_utils.js";
import { ui_cache } from "./ui_cache.js";

/* define some global constants for the canvas, its context and a list of transformation functions */
const canvas = ui_cache.canvas;
const ctx = ui_cache.ctx;
const transform_order = {
    rotate: rotate,
    flip_horizontal: flip_horizontal,
    flip_vertical: flip_vertical
};

/* a function that applies all transformations in the order defined by transform_order */
function apply_transforms(transforms, canvas, ctx) {
    Object.entries(transform_order).forEach(([key, func]) => transforms[key] ? func(transforms[key], canvas, ctx) : null);
}

/* functions that apply transformations to the canvas context */
function flip_horizontal(flipbool, canvas, ctx) {
    if (!flipbool) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
}

function flip_vertical(flipbool, canvas, ctx) {
    if (!flipbool) return;
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
}

function rotate(degrees, canvas, ctx) {
    const source = app.get_source();
    if (!source.image) return;
    degrees = degrees % 360;
    if (degrees === 0) return;
    if (degrees === 90 || degrees === -270) {
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI / 2);
    } else if (degrees === -90 || degrees === 270) {
        ctx.translate(0, canvas.height);
        ctx.rotate(-Math.PI / 2);
    } else if (degrees === 180 || degrees === -180) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate(Math.PI);
    }
}

/* functions that help other functions with canvas operations */
function resize(width, height, canvas, ctx) {
    canvas.width = width;
    canvas.height = height;
}

/* functions that draw to the canvas */
function apply_color_map(canvas, ctx) {
    const mapping = app.get_mapping();
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    image.apply_palette(image_data, (mapping.method === "custom" ? mapping.custom : mapping.colors));
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(image_data, 0, 0);
}

function clear(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw_source(zoom, canvas, ctx) {
    const source = app.get_source();
    if (!source.image) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source.image, 0, 0, source.image.naturalWidth * zoom, source.image.naturalHeight * zoom);
}

/* master function that refreshes the canvas and applies all relevant operations and transforms */
export function render() {
    const source = app.get_source();
    if (!source.image) return;
    const canvas = ui_cache.canvas;
    const ctx = ui_cache.ctx;
    const transforms = app.get_transforms();
    const swap_width_height_nums = [90, -270, -90, 270];

    if (transforms['rotate'] && swap_width_height_nums.includes(transforms['rotate'] % 360)) {
        resize(source.image.naturalHeight * (transforms['zoom'] || 1), source.image.naturalWidth * (transforms['zoom'] || 1), canvas, ctx);
    } else {
        resize(source.image.naturalWidth * (transforms['zoom'] || 1), source.image.naturalHeight * (transforms['zoom'] || 1), canvas, ctx);
    }

    clear(canvas, ctx);
    ctx.save()
    apply_transforms(transforms, canvas, ctx);
    draw_source(transforms['zoom'] || 1, canvas, ctx);
    ctx.restore();
    apply_color_map(canvas, ctx);
}