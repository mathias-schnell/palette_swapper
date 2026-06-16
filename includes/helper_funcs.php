<?php
function process_image($file) {
    $image = $src = null;
    $width = $height = 0;
    $palette = [];
    $image = load_image_from_upload($file);

    if (!$image) return compact('image', 'src', 'width', 'height', 'palette');

    $src = 'data:image/png;base64,' . base64_encode(image_to_string($image));
    [$width, $height] = [imagesx($image), imagesy($image)];
    $palette = extract_palette($image);

    return compact('image', 'src', 'width', 'height', 'palette');
}

function extract_palette($image) {
    $palette = [];
    [$width, $height] = [imagesx($image), imagesy($image)];

    for ($y = 0; $y < $height; $y++):
        for ($x = 0; $x < $width; $x++):
            $color = imagecolorsforindex($image, imagecolorat($image, $x, $y));
            if ($color['alpha'] === 127) continue;

            $hex = sprintf('%02x%02x%02x', $color['red'], $color['green'], $color['blue']);
            if (!isset($palette[$hex])) $palette[$hex] = 0;

            $palette[$hex]++;
        endfor;
    endfor;

    arsort($palette);
    return $palette;
}

function load_image_from_upload($file) {
    if (!$file || $file['error'] !== UPLOAD_ERR_OK) return null;

    $loader = get_image_loader(mime_content_type($file['tmp_name']));
    if (!$loader) return null;

    return $loader($file['tmp_name']);
}

function rgb_distance($rgb_a, $rgb_b) {
    return sqrt(
        (($rgb_a['red'] - $rgb_b['red']) ** 2) +
        (($rgb_a['green'] - $rgb_b['green']) ** 2) +
        (($rgb_a['blue'] - $rgb_b['blue']) ** 2)
    );
}

function find_closest_color($source_hex, $target_palette) {
    $source_rgb = hex_to_rgb($source_hex);
    $closest_hex = null;
    $closest_distance = INF;

    foreach (array_keys($target_palette) as $target_hex):
        $target_rgb = hex_to_rgb($target_hex);
        $distance = rgb_distance($source_rgb, $target_rgb);
        if ($distance >= $closest_distance) continue;
        $closest_distance = $distance;
        $closest_hex = $target_hex;
    endforeach;

    return $closest_hex;
}

function generate_palette_map($source_palette, $target_palette) {
    $map = [];

    if (empty($target_palette)) return $map;

    foreach (array_keys($source_palette) as $source_hex):
        $map[$source_hex] = find_closest_color($source_hex, $target_palette);
    endforeach;

    return $map;
}

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

function hex_to_rgb($hex) {
    return ['red' => hexdec(substr($hex, 0, 2)), 'green' => hexdec(substr($hex, 2, 2)), 'blue' => hexdec(substr($hex, 4, 2))];
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
            if (!function_exists('imagewebp')):
                ob_end_clean();
                return false;
            endif;

            imagewebp($image);
            break;
        default:
            ob_end_clean();
            return false;
    endswitch;
    return ob_get_clean();
}

function rgb_to_hex($rgb) {
    return sprintf('%02x%02x%02x', $rgb['red'], $rgb['green'], $rgb['blue']);
}