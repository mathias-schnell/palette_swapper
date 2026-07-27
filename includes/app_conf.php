<?php
    $demo_mode = true;
    $sidebar_conf = [];
    $toolbar_conf = [
        'File' => [
            'Load Source Image' => 'load_source',
            'Load Target Palette' => 'load_palette',
            '---' => '---',
            'Export Image' => [
                'PNG' => 'export_png',
                'JPG' => 'export_jpg',
                'GIF' => 'export_gif'
            ]
        ],
        'Image' => [
            'Flip' => [
                'Horizontal' => 'flip_h',
                'Vertical' => 'flip_v'
            ],
            'Rotate' => [
                '90° Clockwise' => 'rotate_90cw',
                '90° Counterclockwise' => 'rotate_90ccw',
                '180°' => 'rotate_180'
            ]
        ],
        'Palette' => []
    ];
    $workspace_conf = [];