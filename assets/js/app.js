const app = {
    mapping: {
        colors: {},
        custom: {},
        method: 'reset'
    },
    settings: {
        zoom: 1.00
    },
    source: {
        image: null,
        palette: {}
    },
    target: {
        image: null,
        palette: {}
    }
};

export const tooltip_config = {
    delay: 200,
    offset_x: 5,
    offset_y: 0
}

export function get_mapping() { return app.mapping; }
export function get_settings() { return app.settings; }
export function get_source() { return app.source; }
export function get_target() { return app.target; }
export function update_mapping(data) { Object.assign(app.mapping, data); }
export function update_settings(data) { Object.assign(app.settings, data); }
export function update_source(data) { Object.assign(app.source, data); }
export function update_target(data) { Object.assign(app.target, data); }