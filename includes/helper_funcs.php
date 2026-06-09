<?php

function get_image_loader($mime) {
    switch ($mime):
        case 'image/png':
            return 'imagecreatefrompng';
        case 'image/jpeg':
        case 'image/jpg':
            return 'imagecreatefromjpeg';
        case 'image/gif':
            return 'imagecreatefromgif';
        case 'image/webp':
            return function_exists('imagecreatefromwebp') ? 'imagecreatefromwebp' : null;
        default:
            return null;
    endswitch;
}

function image_to_string($image, $format = 'png') {
    ob_start();
    switch ($format):
        case 'png':
            imagepng($image);
            break;
        case 'jpeg':
        case 'jpg':
            imagejpeg($image);
            break;
        case 'gif':
            imagegif($image);
            break;
        case 'webp':
            if (function_exists('imagewebp')):
                imagewebp($image);
            else:
                ob_end_clean();
                return false;
            endif;
            break;
        default:
            ob_end_clean();
            return false;
    endswitch;
    return ob_get_clean();
}

function hex_to_rgb($hex) {
    return [
        'red' => hexdec(substr($hex, 0, 2)),
        'green' => hexdec(substr($hex, 2, 2)),
        'blue' => hexdec(substr($hex, 4, 2))
    ];
}

function rgb_to_hex($rgb) {
    return sprintf('%02x%02x%02x', $rgb['red'], $rgb['green'], $rgb['blue']);
}