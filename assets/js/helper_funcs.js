function redraw_palette() {
    if (!Object.keys(app.source.palette).length) return;
    if (!Object.keys(app.target.palette).length) return;

    const container = document.getElementById('palette_container');
    const template = document.getElementById('palette_row_prime');

    container.querySelectorAll('.palette_row:not(#palette_row_prime)').forEach(el => el.remove());
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

function rgb_distance(rgb_a, rgb_b) {
    return Math.sqrt(((rgb_a[0] - rgb_b[0]) ** 2) + ((rgb_a[1] - rgb_b[1]) ** 2) + ((rgb_a[2] - rgb_b[2]) ** 2));
}

function find_closest_color(source_hex, target_palette) {
    const source_rgb = hex_to_rgb(source_hex);
    let closest_hex = null;
    let closest_distance = Infinity;

    Object.keys(target_palette).forEach(target_hex => {
        const distance = rgb_distance(source_rgb, hex_to_rgb(target_hex));
        if (distance >= closest_distance) return;
        closest_hex = target_hex;
        closest_distance = distance;
    });
    return closest_hex;
}

function generate_palette_map() {
    if (!Object.keys(app.source.palette).length || !Object.keys(app.target.palette).length) return;
    
    const map = {};
    
    Object.keys(app.source.palette).forEach(
        source_hex => map[source_hex] = find_closest_color(source_hex, app.target.palette)
    );
    return map;
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

    return Object.fromEntries(
        Object.entries(palette).sort((a, b) => b[1] - a[1])
    );
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
            [app.source.width, app.source.height] = [app.source.image.naturalWidth, app.source.image.naturalHeight];
            app.source.palette = extract_palette(app.source.image);
            [app.canvas.element.width, app.canvas.element.height] = [app.source.image.naturalWidth,app.source.image.naturalHeight];
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
        const replacement = app.mapping.colors[hex];
        if (!replacement) continue;

        const [r, g, b] = hex_to_rgb(replacement);

        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
    }
}

function close_sidebar() {
    document.getElementById('sidebar').classList.remove('open');

    document.querySelectorAll('.sidebar_panel').forEach(
        panel => panel.classList.remove('open')
    );
}

function hex_to_rgb(hex) {
    return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
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
    app.tooltip.element.style.left = `${rect.right + app.tooltip.offset_x}px`;
    app.tooltip.element.style.top = `${rect.top + (rect.height / 2) + app.tooltip.offset_y}px`;
    app.tooltip.element.style.transform = 'translateY(-50%)';
}

function redraw_preview() {
    const { ctx, element } = app.canvas;
    const img = app.source.image;
    if (!ctx || !element || !img) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, element.width, element.height);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,0, 0, element.width, element.height);

    const image_data = ctx.getImageData(0, 0, element.width, element.height);
    apply_palette(image_data);
    ctx.putImageData(image_data, 0, 0);
}

function reset_color_map() {
    Object.keys(app.mapping.colors).forEach(item => app.mapping.colors[item] = item)
    redraw_palette();
    redraw_preview();
}

function rgb_to_hex(r, g, b) {
    return [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function update_color_map() {
    app.mapping.colors = generate_palette_map();
    redraw_palette();
    redraw_preview();
}

function update_canvas_scale(scale) {
    const w = app.source.image.naturalWidth;
    const h = app.source.image.naturalHeight;

    app.canvas.element.width = w * scale;
    app.canvas.element.height = h * scale;

    redraw_preview(scale);
}