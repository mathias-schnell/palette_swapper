const color_dist_funcs = {
    rgb: get_distance_rgb,
    rgb_w: get_distance_rgb_w,
    hsv: get_distance_hsv,
    lab: get_distance_lab,
    oklab: get_distance_oklab,
    custom: get_distance_oklab
};

export function find_closest_color(source_hex, palette, method) {
    if (method === "reset" || method === "custom") return source_hex;
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

export function generate_palette_map(source_palette, target_palette, method) {
    const map = {};
    Object.keys(source_palette).forEach(source_hex => map[source_hex] = find_closest_color(source_hex, target_palette, method));
    return map;
}

export function get_distance_hsv(rgb_a, rgb_b) {
    const [h1, s1, v1] = rgb_to_hsv(...rgb_a);
    const [h2, s2, v2] = rgb_to_hsv(...rgb_b);
    const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
    return Math.sqrt((dh ** 2) + ((s1 - s2) ** 2) + ((v1 - v2) ** 2));
}

export function get_distance_lab(rgb_a, rgb_b) {
    return euclidean_distance(rgb_to_lab(...rgb_a), rgb_to_lab(...rgb_b));
}

export function get_distance_oklab(rgb_a, rgb_b) {
    return euclidean_distance(rgb_to_oklab(...rgb_a), rgb_to_oklab(...rgb_b));
}

export function get_distance_rgb(rgb_a, rgb_b) {
    return euclidean_distance(rgb_a, rgb_b);
}

export function get_distance_rgb_w(rgb_a, rgb_b, weights = [0.3, 0.59, 0.11]) {
    return Math.sqrt(weights[0] * ((rgb_a[0] - rgb_b[0]) ** 2) + weights[1] * ((rgb_a[1] - rgb_b[1]) ** 2) + weights[2] * ((rgb_a[2] - rgb_b[2]) ** 2));
}

export function hex_to_rgb(hex) {
    return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

export function rgb_to_hex(r, g, b) {
    return [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function euclidean_distance(a, b) {
    return Math.sqrt(a.reduce((sum, value, i) => sum + ((value - b[i]) ** 2), 0));
}

function linear_to_oklab(r, g, b) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s ];
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

function rgb_to_linear(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    return [(r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)),
            (g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)),
            (b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4))];
}


function rgb_to_oklab(r, g, b) {
    return linear_to_oklab(...rgb_to_linear(r, g, b));
}

function rgb_to_xyz(r, g, b) {
    [r, g, b] = rgb_to_linear(r, g, b);
    return [r * 41.24 + g * 35.76 + b * 18.05, r * 21.26 + g * 71.52 + b * 7.22, r * 1.93 + g * 11.92 + b * 95.05];
}

function xyz_to_lab(x, y, z) {
    x /= 95.047; y /= 100.000; z /= 108.883;
    const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
    return [(116 * f(y)) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}