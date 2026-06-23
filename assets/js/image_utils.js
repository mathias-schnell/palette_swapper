import { app } from "./app.js";
import * as color from "./color_utils.js"

export function apply_palette(image_data, palette) {
    const pixels = image_data.data;
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;
        const replacement = palette[color.rgb_to_hex(pixels[i], pixels[i + 1], pixels[i + 2])];
        if (!replacement) continue;
        [pixels[i], pixels[i + 1], pixels[i + 2]] = color.hex_to_rgb(replacement);
    }
}

export function load_source_image(e, callback) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        app.source.image = new Image();
        app.source.image.onload = () => {
            [app.source.width, app.source.height] = [app.source.image.naturalWidth, app.source.image.naturalHeight];
            app.source.palette = extract_palette(app.source.image);
            [app.canvas.element.width, app.canvas.element.height] = [app.source.image.naturalWidth, app.source.image.naturalHeight];
            app.canvas.element.style.display = "block";
            if (typeof callback === 'function') callback();
        };
        app.source.image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

export function load_target_image(e, callback) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        app.target.image = new Image();
        app.target.image.onload = () => {
            app.target.palette = extract_palette(app.target.image);
            populate_palette_dropdown(document.querySelector("#palette_row_prime .target_hex_select"), app.target.palette);
            if (typeof callback === 'function') callback();
        };
        app.target.image.src = event.target.result;
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

function populate_palette_dropdown(select, palette) {
    select.replaceChildren();
    Object.keys(palette).forEach((hex) => {
        const option = document.createElement("option");
        option.value = hex;
        option.textContent = `#${hex}`;
        select.appendChild(option);
    })
}