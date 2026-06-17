const app = {
    canvas: {
        ctx: null,
        element: null,
    },
    source: {
        image: null,
        palette: {},
        width: 0,
        height: 0
    },
    target: {
        image: null,
        palette: {}
    },
    mapping: {
        colors: {},
        method: 'reset'
    },
    settings: {
        scale: 1.00
    },
    tooltip: {
        delay: 200,
        offset_x: 5,
        offset_y: 0
    },
    ui: {
        color_map_method: null,
        scale_input: null,
        tooltip: null,
    }
};

app.tooltip.element = document.getElementById('tooltip');
app.canvas.element = document.getElementById('preview_canvas');
if (app.canvas.element) {
    app.canvas.ctx = app.canvas.element.getContext('2d', { willReadFrequently: true });
}
Object.keys(app.ui).forEach(key => {
    app.ui[key] = document.getElementById(key);
});

const color_dist_funcs = {
    rgb: get_distance_rgb,
    rgb_w: get_distance_rgb_w,
    hsv: get_distance_hsv,
    lab: get_distance_lab,
    oklab: get_distance_oklab
};

document.getElementById('scale_up').addEventListener('click', () => adjust_scale(0.25));
document.getElementById('scale_down').addEventListener('click', () => adjust_scale(-0.25));
document.getElementById('image_upload').addEventListener('change', load_source_image);
document.getElementById('target_upload').addEventListener('change', load_target_image);
document.getElementById('color_map_method').addEventListener('change', update_palette_map);
document.getElementById('apply_palette_changes').addEventListener('click', redraw_preview);
document.querySelectorAll('input[type=color]').forEach(input => app.mapping.colors[input.dataset.original] = input.value.replace('#', ''));
document.querySelectorAll('.sidebar_tabs > .sidebar_tab').forEach(
    element => element.addEventListener('click', () => { 
        element.dataset.panel === 'close' ? close_sidebar() : open_sidebar(element.dataset.panel); 
    })
);
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', () => {
        tooltip_timer = setTimeout(() => {
            app.tooltip.element.textContent = element.dataset.tooltip;
            position_tooltip(element);
            app.tooltip.element.classList.add('visible');
        }, app.tooltip.delay);
    });
    element.addEventListener('mouseleave', () => {
        clearTimeout(tooltip_timer);
        app.tooltip.element.classList.remove('visible');
    });
});