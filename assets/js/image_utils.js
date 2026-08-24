/*
    * image_utils.js
    * This file contains utility functions for image loading and manipulation.
*/

import * as app from "./app.js";
import * as color from "./color_utils.js";
import { ui_cache } from "./ui_cache.js";

export function apply_palette(image_buffer, uint32_palette) {
    for (let i = 0; i < image_buffer.length; i++) {
        if ((image_buffer[i] & 0xFF000000) === 0) continue;
        const replacement = uint32_palette.get(image_buffer[i]);
        if (replacement !== undefined) image_buffer[i] = replacement;
    }
}

export function export_image(filename = "project.png", filetype = "image/png") {
    const link = document.createElement("a");
    link.href = ui_cache.canvas.toDataURL(filetype);
    link.download = filename;
    link.click();
}

export function load_source(source) {
    if (source?.target?.files) source = source.target.files[0];
    if (!source) return;

    const src = { image: new Image(), palette: new Map() };
    src.image.crossOrigin = "Anonymous";
    src.image.onload = () => {
        const palette = extract_palette(src.image);
        app.reset_image_cache();
        app.reset_history();
        app.reset_mapping();
        app.reset_source();
        app.reset_transforms();
        app.set_source_image(src.image);
        app.set_source_palette(palette);
        app.set_source_palette_uint32(palette_to_uint32(palette));
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
        const palette = extract_palette(tar.image);
        app.reset_target();
        app.set_target_image(tar.image);
        app.set_target_palette(palette);
        app.set_target_palette_uint32(palette_to_uint32(palette));
        if (target instanceof File || target instanceof Blob) { URL.revokeObjectURL(tar.image.src); }
        document.dispatchEvent(new CustomEvent("image_upload", { detail: { type: "target" } }));
    }

    if (target instanceof File || target instanceof Blob) {
        tar.image.src = URL.createObjectURL(target);
    } else if (typeof target === 'string') {
        tar.image.src = target;
    }
}

export function palette_to_uint32(palette) {
    const uint32_palette = new Map();
    for (const [src_hex, tar_hex] of palette.entries()) {
        uint32_palette.set(color.hex_to_uint32(src_hex), color.hex_to_uint32(tar_hex));
    }
    return uint32_palette;
}

export function update_palette_mapping() {
    const method = app.get_mapping_method();
    const locked_colors = app.get_mapping_locked();
    const new_map = color.generate_palette_map(app.get_source_palette(), app.get_target_palette(), method);
    const colors = app.get_mapping_colors();
    const custom = (app.get_mapping_custom().size === 0 ? structuredClone(colors) : app.get_mapping_custom());
    for (const key of new_map.keys()) {
        if(locked_colors.has(key)) {
            new_map.set(key, locked_colors.get(key));
            custom.set(key, locked_colors.get(key));
        }
    }
    app.set_mapping_colors(new_map);
    app.set_mapping_colors_uint32(palette_to_uint32(new_map));
    app.set_mapping_custom(custom);
    app.set_mapping_custom_uint32(palette_to_uint32(custom));
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