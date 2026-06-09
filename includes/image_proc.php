<?php

function process_uploaded_image() {
    $image = null;
    $src = null;
    $width = 0;
    $height = 0;
    $palette = [];

    $image = load_image_from_upload($_FILES['image'] ?? null);
    if (!$image):
        return compact('image', 'src', 'width', 'height', 'palette');
    endif;
    
    $src = 'data:image/png;base64,' . base64_encode(image_to_string($image, 'png'));
    $width = imagesx($image);
    $height = imagesy($image);
    $palette = extract_palette($image);

    return compact('image', 'src', 'width', 'height', 'palette');
}

function extract_palette($image) {
    $palette = [];
    $width = imagesx($image);
    $height = imagesy($image);
    for ($y = 0; $y < $height; $y++):
        for ($x = 0; $x < $width; $x++):
            $index = imagecolorat($image, $x, $y);
            $color = imagecolorsforindex($image, $index);
            if ($color['alpha'] === 127):
                continue;
            endif;
            $hex = sprintf('%02x%02x%02x', $color['red'], $color['green'], $color['blue']);
            if (!isset($palette[$hex])):
                $palette[$hex] = 0;
            endif;
            $palette[$hex]++;
        endfor;
    endfor;
    arsort($palette);
    return $palette;
}

function load_image_from_upload($file) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK):
        return null;
    endif;

    $mime = mime_content_type($file['tmp_name']);
    $loader = get_image_loader($mime);
    if (!$loader):
        return null;
    endif;

    return $loader($file['tmp_name']);
}