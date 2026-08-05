/*
    * history_utils.js
    * This file contains functions for managing the history of actions in the application.
*/

import * as app from "./app.js";

export function add_to_history(action) {
    const history = app.get_history();
    history.actions = history.actions.slice(0, history.current + 1);
    history.actions.push(action);
    app.advance_history();
}

export function remove_from_history(index = null) {
    const history = app.get_history();
    if(history.current >= 0) {
        history.actions.splice(history.current, 1);
        app.regress_history();
    }
}

export function redo() {
    const history = app.get_history();
    app.advance_history();
    rebuild_transforms_from_history();
}

export function undo() {
    const history = app.get_history();
    app.regress_history();
    rebuild_transforms_from_history();
}

function rebuild_transforms_from_history() {
    const history = app.get_history();
    const transforms = new Map();
    console.log(history);
    for (let i = 0; i <= history.current; i++) {
        const action = history.actions[i];
        transforms.set(action.name, action.args);
    }
    app.update_transforms(transforms);
    document.dispatchEvent(new CustomEvent("history_change", {} ));
}