import { app } from "./app.js"
import * as image from "./image_utils.js"
import * as ui from "./ui_utils.js"

initialize_app();
bind_events();

function initialize_app() {
    app.tooltip.element = document.getElementById('tooltip');
    app.canvas.element = document.getElementById('preview_canvas');
    if (app.canvas.element) {
        app.canvas.ctx = app.canvas.element.getContext('2d', { willReadFrequently: true });
    }
    Object.entries(app.ui).forEach(([key]) => {
        app.ui[key] = document.getElementById(key);
    });
}

function bind_events() {
    document.addEventListener('click',ui.close_all_menus);
    document.getElementById('scale_up').addEventListener('click', () => ui.adjust_scale(0.25));
    document.getElementById('scale_down').addEventListener('click', () => ui.adjust_scale(-0.25));
    document.getElementById('color_map_method').addEventListener('change', ui.update_palette_map);
    document.getElementById('apply_palette_changes').addEventListener('click', ui.redraw_preview);
    document.getElementById('load_source_image').addEventListener('click', () => document.getElementById('image_upload').click());
    document.getElementById('load_target_palette').addEventListener('click',() => document.getElementById('target_upload').click());
    document.querySelectorAll('input[type=color]').forEach(input => app.mapping.colors[input.dataset.original] = input.value.replace('#', ''));
    document.getElementById('image_upload').addEventListener('change', e =>
        image.load_source_image(e, () => {
            ui.redraw_palette();
            ui.redraw_preview();
        })
    );
    document.getElementById('target_upload').addEventListener('change', e =>
        image.load_target_image(e, () => {
            ui.redraw_palette();
        })
    );
    document.querySelectorAll('.sidebar_tabs > .sidebar_tab').forEach(
        element => element.addEventListener('click', () => { 
            element.dataset.panel === 'close' ? ui.close_sidebar() : ui.open_sidebar(element.dataset.panel); 
        })
    );
    document.querySelectorAll('.toolbar_item[data-menu]').forEach(element => {
        element.addEventListener('click', e => { 
            e.stopPropagation();
            ui.open_menu(`menu_${element.dataset.menu}`);
        });
    });
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        let tooltip_timer = null;
        element.addEventListener('mouseenter', () => {
            tooltip_timer = setTimeout(() => {
                app.tooltip.element.textContent = element.dataset.tooltip;
                ui.position_tooltip(element);
                app.tooltip.element.classList.add('visible');
            }, app.tooltip.delay);
        });
        element.addEventListener('mouseleave', () => {
            clearTimeout(tooltip_timer);
            app.tooltip.element.classList.remove('visible');
        });
    });
    
}