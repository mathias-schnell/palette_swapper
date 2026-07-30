/*
    * app.js
    * This file contains the main application state and functions for managing it.
*/

/* the app state */
const app = {
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
    transforms: {}
};

/* tooltip configuration settings */
export const tooltip_config = {
    delay: 200,
    offset_x: 5,
    offset_y: 0
}

/* get functions that return specific pieces of the app state */
export function get_mapping() { return app.mapping; }
export function get_source() { return app.source; }
export function get_target() { return app.target; }
export function get_transforms() { return app.transforms; }

/* update functions that merge new data into the app state */
export function update_mapping(data) { Object.assign(app.mapping, data); }
export function update_source(data) { Object.assign(app.source, data); }
export function update_target(data) { Object.assign(app.target, data); }
export function update_transforms(data) { Object.assign(app.transforms, data); }

/* specialized functions for interacting with the app state */
export function remove_lock(source) { delete app.mapping.locked.delete(source); }
export function remove_transform(name) { delete app.transforms[name]; }
export function set_lock(source, target) { app.mapping.locked.set(source, target); }
export function set_transform(name, args) { app.transforms[name] = args; }