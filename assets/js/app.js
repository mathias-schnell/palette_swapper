/*
    * app.js
    * This file contains the main application state and functions for managing it.
*/

/* the app state */
const app = {
    base_image_cache: null,
    new_base_image: false,
    history: {
        actions: [],
        current: -1
    },
    mapping: {
        colors: new Map(),          // key type - string, value type - string
        colors_uint32: new Map(),   // key type - uint32, value type - uint32
        custom: new Map(),          // key type - string, value type - string
        custom_uint32: new Map(),   // key type - uint32, value type - uint32
        locked: new Map(),          // key type - string, value type - string
        method: 'reset'
    },
    source: {
        image: new Image(),
        palette: new Map(),         // key type - string, value type - number
        palette_uint32: new Map()   // key type - uint32, value type - uint32
    },
    target: {
        image: new Image(),
        palette: new Map(),         // key type - string, value type - number
        palette_uint32: new Map()   // key type - uint32, value type - uint32
    },
    transforms: new Map(),
};

/* tooltip configuration settings */
export const tooltip_config = {
    delay: 200,
    offset_x: 15,
    offset_y: 0
}

/* getter functions that return specific pieces of the app state */
export function get_base_image_cache()          { return app.base_image_cache; }
export function get_new_base_image()            { return app.new_base_image; }
export function get_history_actions()           { return app.history.actions; }
export function get_history_current()           { return app.history.current; }
export function get_mapping_colors()            { return app.mapping.colors; }
export function get_mapping_colors_uint32()     { return app.mapping.colors_uint32; }
export function get_mapping_custom()            { return app.mapping.custom; }
export function get_mapping_custom_uint32()     { return app.mapping.custom_uint32; }
export function get_mapping_locked()            { return app.mapping.locked; }
export function get_mapping_method()            { return app.mapping.method; }
export function get_source_image()              { return app.source.image; }
export function get_source_palette()            { return app.source.palette; }
export function get_source_palette_uint32()     { return app.source.palette_uint32; }
export function get_target_image()              { return app.target.image; }
export function get_target_palette()            { return app.target.palette; }
export function get_target_palette_uint32()     { return app.target.palette_uint32; }
export function get_transforms()                { return app.transforms; }

/* setter functions for specific app state properties */
export function set_base_image_cache(image_data)            { app.base_image_cache = image_data; }
export function set_new_base_image(new_base_image)          { app.new_base_image = new_base_image; }
export function set_history_actions(actions)                { app.history.actions = actions; }
export function set_history_current(current)                { app.history.current = current; }
export function set_mapping_colors(colors)                  { app.mapping.colors = colors; }
export function set_mapping_colors_uint32(colors_uint32)    { app.mapping.colors_uint32 = colors_uint32; }
export function set_mapping_custom(custom)                  { app.mapping.custom = custom; }
export function set_mapping_custom_uint32(custom_uint32)    { app.mapping.custom_uint32 = custom_uint32; }
export function set_mapping_locked(locked)                  { app.mapping.locked = locked; }
export function set_mapping_method(method)                  { app.mapping.method = method; }
export function set_source_image(image)                     { app.source.image = image; }
export function set_source_palette(palette)                 { app.source.palette = palette; }
export function set_source_palette_uint32(palette_uint32)   { app.source.palette_uint32 = palette_uint32; }
export function set_target_image(image)                     { app.target.image = image; }
export function set_target_palette(palette)                 { app.target.palette = palette; }
export function set_target_palette_uint32(palette_uint32)   { app.target.palette_uint32 = palette_uint32; }
export function set_transforms(transforms)                  { app.transforms = transforms; }

/* specialized functions for interacting with the app state */
export function advance_history() { if(app.history.current < app.history.actions.length - 1) { app.history.current++; } }
export function regress_history() { if(app.history.current > -1) { app.history.current--; } }
export function create_lock(source, target) { app.mapping.locked.set(source, target); }
export function remove_lock(source) { app.mapping.locked.delete(source); }
export function remove_transform(name) { app.transforms.delete(name); }

/* app state initialization/reset functions */
export function reset() {
    reset_image_cache();
    reset_history();
    reset_mapping();
    reset_source();
    reset_target();
    reset_transforms();
    rebuild_transforms();
}

export function reset_history() {
    set_history_actions([]);
    set_history_current(-1);
}

export function reset_image_cache() {
    set_base_image_cache(null);
}

export function reset_mapping() {
    set_mapping_colors(new Map());
    set_mapping_colors_uint32(new Map());
    set_mapping_custom(new Map());
    set_mapping_custom_uint32(new Map());
    set_mapping_locked(new Map());
    set_mapping_method('reset');
}

export function reset_source() {
    set_source_image(new Image());
    set_source_palette(new Map());
    set_source_palette_uint32(new Map());
}

export function reset_target() {
    set_target_image(new Image());
    set_target_palette(new Map());
    set_target_palette_uint32(new Map());
}

export function reset_transforms() {
    set_transforms(new Map());
}

/* functions for interacting with the app action history */
export function add_to_history(action) {
    let history_actions = get_history_actions();
    history_actions = history_actions.slice(0, get_history_current() + 1);
    history_actions.push(action);
    set_history_actions(history_actions);
    advance_history();
    rebuild_transforms(); 
}

export function remove_from_history(index) {
    let history_actions = get_history_actions();
    if (index < 0 || index >= history_actions.length) return;
    history_actions.splice(index, 1);
    if (index <= get_history_current()) regress_history();
    set_history_actions(history_actions);
    rebuild_transforms(); 
}

/* functions for rebuilding the transformations based on changes to the history */
export function rebuild_transforms() {
    const transforms = new Map();
    const history_actions = get_history_actions();
    for (let i = 0; i <= get_history_current(); i++) {
        const type = history_actions[i].type;
        const val = simplify_transform_value(type, transforms.get(type), history_actions[i].value);
        transforms.set(type, val);
    }
    set_transforms(transforms);
    document.dispatchEvent(new CustomEvent("history_change", {} ));
}

/* helper function for simplifying transform values */
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