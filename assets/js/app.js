export const app = {
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