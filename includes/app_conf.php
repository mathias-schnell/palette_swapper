<?php
    $demo_mode = true;
    $toolbar_conf = [
        'File' => [
            'Load Source Image' => 'load_source',
            'Load Target Palette' => 'load_palette',
            '---' => '---',
            'Export Image' => [
                'PNG' => 'export_png',
                'JPG' => 'export_jpg',
                'GIF' => 'export_gif',
            ],
        ],
        'Edit' => [
            'Undo' => 'undo',
            'Redo' => 'redo',
            '---' => '---',
            'Zoom In' => 'zoom_in',
            'Zoom Out' => 'zoom_out',
        ],
        'Image' => [
            'Flip' => [
                'Horizontal' => 'flip_h',
                'Vertical' => 'flip_v',
            ],
            'Rotate' => [
                '90° Clockwise' => 'rotate_90cw',
                '90° Counterclockwise' => 'rotate_90ccw',
                '180°' => 'rotate_180',
            ],
        ],
        'Palette' => [
            'Show Source Palette' => 'show_source_palette',
            'Show Target Palette' => 'show_target_palette',
        ],
        /*'Themes' => [
            'Light' => 'light',
            'Dark' => 'dark',
        ]*/
    ];
    $toolbar_no_disable = [ 'load_source', 'load_palette', 'undo', 'redo', 'light', 'dark' ];