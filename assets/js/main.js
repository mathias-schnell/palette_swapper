const color_map = {};
const tooltip = document.getElementById('tooltip');
const image = document.getElementById('source_image');
const canvas = document.getElementById('preview_canvas');
let ctx = null;
const tooltip_settings = {
    delay: 200,
    offset_x: 5,
    offset_y: 0
};

if (canvas && image) {
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    const render = () => {
        [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
        redraw_preview();
    };
    image.complete ? render() : image.onload = render;
}

document.getElementById('scale_up').addEventListener('click', () => adjust_scale(0.5));
document.getElementById('scale_down').addEventListener('click', () => adjust_scale(-0.5));
document.querySelectorAll('input[type=color]').forEach(input => color_map[input.dataset.original] = input.value.replace('#', ''));
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', () => {
        tooltip_timer = setTimeout(() => {
            tooltip.textContent = element.dataset.tooltip;
            position_tooltip(element);
            tooltip.classList.add('visible');
        }, tooltip_settings.delay);
    });
    element.addEventListener('mouseleave', () => {
        clearTimeout(tooltip_timer);
        tooltip.classList.remove('visible');
    });
});

function adjust_scale(delta) {
    const scale_input = document.querySelector('input[name=scale]');
    scale_input.value = Math.max(1.0, Math.min(5.0, parseFloat(scale_input.value) + delta)).toFixed(1);
    update_canvas_scale(parseFloat(scale_input.value));
}

function apply_palette(image_data) {
    const pixels = image_data.data;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;

        const hex = rgb_to_hex(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (!color_map[hex]) continue;

        const replacement = color_map[hex];

        pixels[i] = parseInt(replacement.substring(0, 2), 16);
        pixels[i + 1] = parseInt(replacement.substring(2, 4), 16);
        pixels[i + 2] = parseInt(replacement.substring(4, 6), 16);
    }
}

function close_sidebar() {
    document.getElementById('sidebar').classList.remove('open');

    document.querySelectorAll('.sidebar_panel').forEach(
        panel => panel.classList.remove('open')
    );
}

function hex_to_rgb(hex) {
    return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16)
    ];
}

function open_sidebar(panel_id) {
    document.getElementById('sidebar').classList.add('open');
    const panels = document.querySelectorAll('.sidebar_panel');
    const target = document.getElementById(panel_id);
    panels.forEach(panel => panel.classList.remove('open'));
    target.classList.add('open');
}

function position_tooltip(element) {
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.right + tooltip_settings.offset_x}px`;
    tooltip.style.top = `${rect.top + (rect.height / 2) + tooltip_settings.offset_y}px`;
    tooltip.style.transform = 'translateY(-50%)';
}

function redraw_preview() {
    if (!ctx || !canvas || !image) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);

    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    apply_palette(image_data);
    ctx.putImageData(image_data, 0, 0);
}

function reset_color_map() {
    document.querySelectorAll('.palette_row').forEach(item => color_map[item.dataset.source] = item.dataset.source);
    redraw_preview();
}

function rgb_to_hex(r, g, b) {
    return [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function update_color_map() {
    document.querySelectorAll('.palette_row').forEach(item => color_map[item.dataset.source] = item.dataset.target);
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