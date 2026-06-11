const color_map = {};

document.querySelectorAll('input[type=color]').forEach(input => color_map[input.dataset.original] = input.value.replace('#', ''));

const image = document.getElementById('source_image');
const canvas = document.getElementById('preview_canvas');
let ctx = null;
if (canvas && image) {
    ctx = canvas.getContext('2d');
    const render = () => {
        [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
        redraw_preview();
    };
    image.complete ? render() : image.onload = render;
}

function adjust_scale(delta) {
    const scale_input = document.querySelector('input[name=scale]');
    scale_input.value = Math.max(1.0, Math.min(5.0, parseFloat(scale_input.value) + delta)).toFixed(1);
    update_canvas_scale(parseFloat(scale_input.value));
}

function redraw_preview() {
    if (!ctx || !canvas || !image) return;

    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);

    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image_data.data;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;

        const hex = pixels[i].toString(16).padStart(2, '0') + pixels[i + 1].toString(16).padStart(2, '0') + pixels[i + 2].toString(16).padStart(2, '0');
        if (!color_map[hex]) continue;

        const replacement = color_map[hex];

        pixels[i] = parseInt(replacement.substring(0, 2), 16);
        pixels[i + 1] = parseInt(replacement.substring(2, 4), 16);
        pixels[i + 2] = parseInt(replacement.substring(4, 6), 16);
    }

    ctx.putImageData(image_data, 0, 0);
}

function update_color_map() {
    document.querySelectorAll('input[type=color]').forEach(input => color_map[input.dataset.original] = input.value.replace('#', ''));
    redraw_preview();
}

function update_canvas_scale(scale) {
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    canvas.width = w * scale;
    canvas.height = h * scale;

    ctx.imageSmoothingEnabled = false;
    redraw_preview(scale);
}