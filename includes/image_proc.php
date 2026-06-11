<?php
function process_uploaded_image() {
    $image = $src = null;
    $width = $height = 0;
    $palette = [];

    $image = load_image_from_upload($_FILES['image'] ?? null);
    if (!$image) return compact('image', 'src', 'width', 'height', 'palette');

    $src = 'data:image/png;base64,' . base64_encode(image_to_string($image, 'png'));
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