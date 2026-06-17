function adjust_scale(delta) {
    calc_and_update_scale(delta);
    update_scale_ui();
    resize_canvas();
    redraw_preview();
}

function calc_and_update_scale(delta) {
    app.settings.scale = (Math.max(1.00, Math.min(5.00, app.settings.scale + delta)));
}

function update_scale_ui() {
    app.ui.scale_input.value = app.settings.scale.toFixed(2);
}

function resize_canvas() {
    app.canvas.element.width = app.source.image.naturalWidth * app.settings.scale;
    app.canvas.element.height = app.source.image.naturalHeight * app.settings.scale;
}

function apply_palette(image_data) {
    const pixels = image_data.data;
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;
        const replacement = app.mapping.colors[rgb_to_hex(pixels[i], pixels[i + 1], pixels[i + 2])];
        if (!replacement) continue;
        [pixels[i], pixels[i + 1], pixels[i + 2]] = hex_to_rgb(replacement);
    }
}

function close_sidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.querySelectorAll('.sidebar_panel').forEach(
        panel => panel.classList.remove('open')
    );
}

function extract_palette(image) {
    const { canvas, ctx } = image_to_canvas(image);
    const palette = {};
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue;
        const hex = rgb_to_hex(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (!palette[hex]) palette[hex] = 0;
        palette[hex]++;
    }

    return palette;
}

function find_closest_color(source_hex, palette, method) {
    if (method === "reset") return source_hex;
    const source_rgb = hex_to_rgb(source_hex);
    let closest_hex = null;
    let closest_distance = Infinity;
    for (const target_hex of Object.keys(palette)) {
        const target_rgb = hex_to_rgb(target_hex);
        const distance = color_dist_funcs[method](source_rgb, target_rgb);
        if (distance < closest_distance) {
            closest_distance = distance;
            closest_hex = target_hex;
        }
    }
    return closest_hex;
}

function generate_palette_map() {
    if (!Object.keys(app.source.palette).length || !Object.keys(app.target.palette).length) return;
    const map = {};
    Object.keys(app.source.palette).forEach(
        source_hex => map[source_hex] = find_closest_color(source_hex, app.target.palette, app.mapping.method)
    );
    return map;
}

function get_distance_hsv(rgb_a, rgb_b) {
    const [h1, s1, v1] = rgb_to_hsv(...rgb_a);
    const [h2, s2, v2] = rgb_to_hsv(...rgb_b);

    const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
    const ds = s1 - s2;
    const dv = v1 - v2;

    return Math.sqrt(dh * dh + ds * ds + dv * dv);
}

function get_distance_lab(rgb_a, rgb_b) {
    const [l1, a1, b1] = rgb_to_lab(...rgb_a);
    const [l2, a2, b2] = rgb_to_lab(...rgb_b);

    return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

function get_distance_oklab(rgb_a, rgb_b) {
    const [L1, A1, B1] = rgb_to_oklab(rgb_a);
    const [L2, A2, B2] = rgb_to_oklab(rgb_b);

    const dL = L1 - L2;
    const dA = A1 - A2;
    const dB = B1 - B2;

    return Math.sqrt(dL * dL + dA * dA + dB * dB);
}

function get_distance_rgb(rgb_a, rgb_b) {
    return Math.sqrt(((rgb_a[0] - rgb_b[0]) ** 2) + ((rgb_a[1] - rgb_b[1]) ** 2) + ((rgb_a[2] - rgb_b[2]) ** 2));
}

function get_distance_rgb_w(a, b, weights = [0.3, 0.59, 0.11]) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];

    return Math.sqrt(weights[0] * dr * dr + weights[1] * dg * dg + weights[2] * db * db);
}

function hex_to_rgb(hex) {
    return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

function image_to_canvas(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    [canvas.width, canvas.height] = [image.naturalWidth, image.naturalHeight];
    ctx.drawImage(image, 0, 0);
    return { canvas, ctx };
}

function load_source_image(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {
        app.source.image = new Image();

        app.source.image.onload = () => {
            [app.source.width, app.source.height] = [
                app.source.image.naturalWidth,
                app.source.image.naturalHeight
            ];

            app.source.palette = extract_palette(app.source.image);

            [app.canvas.element.width, app.canvas.element.height] = [
                app.source.image.naturalWidth,
                app.source.image.naturalHeight
            ];

            app.canvas.element.style.display = "block";

            redraw_palette();
            redraw_preview();
        };

        app.source.image.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function load_target_image(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {
        app.target.image = new Image();

        app.target.image.onload = () => {
            app.target.palette = extract_palette(app.target.image);
            app.mapping.colors = generate_palette_map();

            redraw_palette();
        };

        app.target.image.src = event.target.result;
    };

    reader.readAsDataURL(file);
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

    app.ui.tooltip.style.left = `${rect.right + app.tooltip.offset_x}px`;
    app.ui.tooltip.style.top = `${rect.top + (rect.height / 2) + app.tooltip.offset_y}px`;
    app.ui.tooltip.style.transform = 'translateY(-50%)';
}

function redraw_palette() {
    if (!Object.keys(app.source.palette).length) return;
    if (!Object.keys(app.target.palette).length) return;

    const container = document.getElementById('palette_container');
    const template = document.getElementById('palette_row_prime');

    container
        .querySelectorAll('.palette_row:not(#palette_row_prime)')
        .forEach(el => el.remove());

    Object.entries(app.mapping.colors).forEach(([source_hex, target_hex]) => {
        const row = template.cloneNode(true);

        row.removeAttribute('id');
        row.style.display = 'block';
        row.dataset.source = source_hex;
        row.dataset.target = target_hex;

        row.querySelector('.source_swatch').style.background = `#${source_hex}`;
        row.querySelector('.target_swatch').style.background = `#${target_hex}`;

        row.querySelector('.source_hex').textContent = `#${source_hex}`;
        row.querySelector('.target_hex').textContent = `#${target_hex}`;

        container.appendChild(row);
    });
}

function redraw_preview() {
    const { ctx, element } = app.canvas;
    const img = app.source.image;

    if (!ctx || !element || !img) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, element.width, element.height);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, element.width, element.height);

    const image_data = ctx.getImageData(0, 0, element.width, element.height);
    apply_palette(image_data);
    ctx.putImageData(image_data, 0, 0);
}

function reset_color_map() {
    Object.keys(app.mapping.colors).forEach(
        item => app.mapping.colors[item] = item
    );

    redraw_palette();
    redraw_preview();
}

function rgb_to_hex(r, g, b) {
    return [r, g, b]
        .map(v => v.toString(16).padStart(2, '0'))
        .join('');
}

function rgb_to_hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }

    const s = max === 0 ? 0 : d / max;
    const v = max;

    return [h, s, v];
}

function rgb_to_lab(r, g, b) {
    const [x, y, z] = rgb_to_xyz(r, g, b);
    return xyz_to_lab(x, y, z);
}

function rgb_to_xyz(r, g, b) {
    r /= 255; g /= 255; b /= 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100; g *= 100; b *= 100;

    return [
        r * 0.4124 + g * 0.3576 + b * 0.1805,
        r * 0.2126 + g * 0.7152 + b * 0.0722,
        r * 0.0193 + g * 0.1192 + b * 0.9505
    ];
}

function update_palette_map() {
    app.mapping.method = app.ui.color_map_method.value;
    app.mapping.colors = generate_palette_map();
    redraw_palette();
}

function xyz_to_lab(x, y, z) {
    const refX = 95.047;
    const refY = 100.000;
    const refZ = 108.883;

    x /= refX; y /= refY; z /= refZ;

    const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);

    const fx = f(x);
    const fy = f(y);
    const fz = f(z);

    return [
        (116 * fy) - 16,
        500 * (fx - fy),
        200 * (fy - fz)
    ];
}

function rgb_to_linear(c) {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linear_to_oklab(r, g, b) {
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    return [0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
            1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
            0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_ ];
}

function rgb_to_oklab(rgb) {
    const r = rgb_to_linear(rgb[0]);
    const g = rgb_to_linear(rgb[1]);
    const b = rgb_to_linear(rgb[2]);

    return linear_to_oklab(r, g, b);
}