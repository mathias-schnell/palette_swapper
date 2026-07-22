/*
    * image_utils.js
    * This file contains utility functions for image loading and manipulation.
*/

import * as app from "./app.js";
import * as color from "./color_utils.js";
import { ui_cache } from "./ui_cache.js";
import { redraw_palette } from "./ui_utils.js";

export function apply_palette(image_data, palette) {
    const pixels = image_data.data;
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;
        const replacement = palette[color.rgb_to_hex(pixels[i], pixels[i + 1], pixels[i + 2])];
        if (!replacement) continue;
        [pixels[i], pixels[i + 1], pixels[i + 2]] = color.hex_to_rgb(replacement);
    }
}

export function export_image(filename = "project.png") {
    const src = app.get_source();
    const mapping = app.get_mapping();
    const canvas = document.createElement("canvas");
    canvas.width = src.image.naturalWidth;
    canvas.height = src.image.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(src.image, 0, 0);
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    apply_palette(image_data, (mapping.method == 'custom' ? mapping.custom : mapping.colors));
    ctx.putImageData(image_data, 0, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
}

export function load_source_image(e, callback) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        const src = {
            image: new Image(),
            palette: {}
        };
        src.image.onload = () => {
            src.palette = extract_palette(src.image);
            app.update_source(src);
            [ui_cache.canvas.width, ui_cache.canvas.height] = [src.image.naturalWidth, src.image.naturalHeight];
            ui_cache.canvas.style.display = "block";
            callback?.()
        };
        src.image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

export function load_target_image(e, callback) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        const tar = {
            image: new Image(),
            palette: {}
        };
        tar.image.onload = () => {
            tar.palette = extract_palette(tar.image);
            app.update_target(tar);
            callback?.()
        };
        tar.image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function extract_palette(image) {
    const { canvas, ctx } = image_to_canvas(image);
    const palette = {};
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;
        const hex = color.rgb_to_hex(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (!palette[hex]) palette[hex] = 0;
        palette[hex]++;
    }
    return palette;
}

function image_to_canvas(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
    ctx.drawImage(image, 0, 0);
    return { canvas, ctx };
}