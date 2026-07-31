/*
    * image_utils.js
    * This file contains utility functions for image loading and manipulation.
*/

import * as app from "./app.js";
import * as color from "./color_utils.js";
import { ui_cache } from "./ui_cache.js";

export function apply_palette(image_data, palette) {
    const buffer = new Uint32Array(image_data.data.buffer);
    for (let i = 0; i < buffer.length; i++) {
        if ((buffer[i] & 0xFF000000) === 0) continue;
        const key = color.uint32_to_hex(buffer[i]);
        const replacement = palette.get(key);
        if (replacement !== undefined) buffer[i] = color.hex_to_uint32(replacement);
    }
}

export function export_image(filename = "project.png", filetype = "image/png") {
    const src = app.get_source();
    const mapping = app.get_mapping();
    const canvas = document.createElement("canvas");
    if(!src.image) return;
    canvas.width = src.image.naturalWidth;
    canvas.height = src.image.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(src.image, 0, 0);
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    apply_palette(image_data, (mapping.method == 'custom' ? mapping.custom : mapping.colors));
    ctx.putImageData(image_data, 0, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL(filetype);
    link.download = filename;
    link.click();
}

export function load_source(source) {
    if (source?.target?.files) source = source.target.files[0];
    if (!source) return;

    const src = { image: new Image(), palette: new Map() };
    src.image.crossOrigin = "Anonymous";
    src.image.onload = () => {
        src.palette = extract_palette(src.image);
        app.update_source(src);
        [ui_cache.canvas.width, ui_cache.canvas.height] = [src.image.naturalWidth, src.image.naturalHeight];
        ui_cache.canvas.style.display = "block";
        if (source instanceof File || source instanceof Blob) { URL.revokeObjectURL(src.image.src); }
        document.dispatchEvent(new CustomEvent("image_upload", { detail: { type: "source" } }));
    };
    src.image.onerror = () => { console.error("Failed to load image from source:", source); };

    if (source instanceof File || source instanceof Blob) {
        src.image.src = URL.createObjectURL(source);
    } else if (typeof source === 'string') {
        src.image.src = source;
    }
}

export function load_target(target) {
    if (target?.target?.files) target = target.target.files[0];
    if (!target) return;

    const tar = { image: new Image(), palette: new Map() };
    tar.image.crossOrigin = "Anonymous";
    tar.image.onload = () => {
        tar.palette = extract_palette(tar.image);
        app.update_target(tar);
        if (target instanceof File || target instanceof Blob) { URL.revokeObjectURL(tar.image.src); }
        document.dispatchEvent(new CustomEvent("image_upload", { detail: { type: "target" } }));
    }

    if (target instanceof File || target instanceof Blob) {
        tar.image.src = URL.createObjectURL(target);
    } else if (typeof target === 'string') {
        tar.image.src = target;
    }
}

function extract_palette(image) {
    const { canvas, ctx } = image_to_canvas(image);
    const palette = new Map();
    const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    for (let i = 0; i < buffer.length; i ++) {
        if ((buffer[i] & 0xFF000000) === 0) continue;
        const key = color.uint32_to_hex(buffer[i]);
        palette.set(key, (palette.get(key) || 0) + 1);
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