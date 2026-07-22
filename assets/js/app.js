/*
    * app.js
    * This file contains the main application state and functions for managing it.
*/

/* the app state is stored in a single object */
const app = {
    mapping: {
        colors: {},
        custom: {},
        locked: {},
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
export function get_settings() { return app.settings; }
export function get_source() { return app.source; }
export function get_target() { return app.target; }

/* update functions that merge new data into the app state */
export function update_mapping(data) { Object.assign(app.mapping, data); }
export function update_settings(data) { Object.assign(app.settings, data); }
export function update_source(data) { Object.assign(app.source, data); }
export function update_target(data) { Object.assign(app.target, data); }

/* specialized functions for interacting with the app state */
export function add_lock(source_hex, target_hex) { app.mapping.locked[source_hex] = target_hex; console.log(app.mapping.locked); }
export function remove_lock(source_hex) { delete app.mapping.locked[source_hex]; console.log(app.mapping.locked); }