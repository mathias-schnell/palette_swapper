/*
    * app.js
    * This file contains the main application state and functions for managing it.
*/

/* the app state */
const app = {
    base_image_cache: null,
    history: {
        actions: [],
        current: -1
    },
    mapping: {
        colors: new Map(), // key type - string, value type - string
        custom: new Map(), // key type - string, value type - string
        locked: new Map(), // key type - string, value type - string
        method: 'reset'
    },
    source: {
        image: new Image(),
        palette: new Map() // key type - string, value type - number
    },
    target: {
        image: new Image(),
        palette: new Map() // key type - string, value type - number
    },
    transforms: new Map(),
};

/* tooltip configuration settings */
export const tooltip_config = {
    delay: 200,
    offset_x: 5,
    offset_y: 0
}

/* get functions that return specific pieces of the app state */
export function get_base_image_cache() { return app.base_image_cache; }
export function get_mapping() { return app.mapping; }
export function get_source() { return app.source; }
export function get_target() { return app.target; }
export function get_transforms() { return app.transforms; }
export function get_history() { return app.history; }

/* update functions that merge new data into the app state */
export function update_mapping(data) { Object.assign(app.mapping, data); }
export function update_source(data) { Object.assign(app.source, data); }
export function update_target(data) { Object.assign(app.target, data); }
export function update_transforms(data) { app.transforms = new Map(data); }
export function update_history(data) { Object.assign(app.history, data); }

/* specialized functions for interacting with the app state */
export function advance_history() { if(app.history.current < app.history.actions.length - 1) { app.history.current++; rebuild_transforms(); } }
export function regress_history() { if(app.history.current > -1) { app.history.current--; rebuild_transforms(); } }
export function remove_transform(name) { app.transforms.delete(name); }
export function remove_lock(source) { app.mapping.locked.delete(source); }
export function set_base_image_cache(image_data) { app.base_image_cache = image_data; }
export function set_lock(source, target) { app.mapping.locked.set(source, target); }

/* specialized functions for interacting with the app history */
export function add_to_history(action) {
    app.history.actions = app.history.actions.slice(0, app.history.current + 1);
    app.history.actions.push(action);
    advance_history();
}

export function clear_history() {
    app.history.actions = [];
    app.history.current = -1;
    rebuild_transforms();
}

export function remove_from_history(index = null) {
    index = (index ?? app.history.current);
    if(index >= 0) {
        app.history.actions.splice(index, 1);
        regress_history();
    }
}

function rebuild_transforms() {
    const transforms = new Map();
    for (let i = 0; i <= app.history.current; i++) {
        const type = app.history.actions[i].type;
        const val = simplify_transform_value(type, transforms.get(type), app.history.actions[i].value);
        transforms.set(type, val);
    }
    app.transforms = transforms;
    document.dispatchEvent(new CustomEvent("history_change", {} ));
}

function simplify_transform_value(type, curr_val, delta_val) {
    switch (type) {
        case 'zoom':
            const zoom = curr_val ?? 1;
            return Math.max(zoom + delta_val, 0.25);
        case 'flip_horizontal':
            const flip_h = curr_val ?? false;
            return !flip_h;
        case 'flip_vertical':
            const flip_v = curr_val ?? false;
            return !flip_v;
        case 'rotate':
            const rotate = curr_val ?? 0;
            return ((rotate + delta_val % 360) + 360) % 360;
        default:
            return curr_val;
    }
}