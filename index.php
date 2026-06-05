<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!extension_loaded('gd')) {
    die("GD extension is not enabled. Enable GD in PHP to process images.");
}

function get_image_loader($mime) {
    switch ($mime) {
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
    }
}

$palette = [];
$image = null;
$width = $height = 0;

if (!empty($_FILES['image']['tmp_name'])) {
    $image_info = getimagesize($_FILES['image']['tmp_name']);
    if ($image_info === false) {
        die("Uploaded file is not a valid image.");
    }

    $loader = get_image_loader($image_info['mime']);
    if ($loader === null) {
        die("Unsupported image type: " . htmlspecialchars($image_info['mime']));
    }
    if (!function_exists($loader) && !is_callable($loader)) {
        die("Required GD function is missing for this image type: " . $image_info['mime']);
    }

    if (is_callable($loader)) {
        $image = $loader($_FILES['image']['tmp_name']);
    } else {
        $image = $loader($_FILES['image']['tmp_name']);
    }

    if (!$image) {
        die("Failed to create image resource.");
    }
}

if($image) {
    $width = imagesx($image);
    $height = imagesy($image);
    for ($y = 0; $y < $height; $y++) {
        for ($x = 0; $x < $width; $x++) {
            $index = imagecolorat($image, $x, $y);
            $color = imagecolorsforindex($image, $index);
            $hex = sprintf('%02x%02x%02x', $color['red'], $color['green'], $color['blue']);
            if (!in_array($hex, $palette)) {
                $palette[$hex] = 0;
            } else {
                $palette[$hex]++;
            }
        }
    }
    arsort($palette);
}

?>

<!doctype html>
<html>
    <head>
        <title>Palette Swapper</title>
    </head>
    <body>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
            h1 {
                margin-bottom: 20px;
            }
            form {
                margin-bottom: 20px;
            }
            input[type="file"] {
                margin-right: 10px;
            }
            button {
                padding: 5px 10px;
            }
            .swatch {
                border: 1px solid #000;
                display: inline-block;
                height: 32px;
                vertical-align: middle;
                width: 32px;
            }
        </style>
        <form method="post" enctype="multipart/form-data">
            <input type="file" name="image" accept="image/png, image/gif, image/jpeg" required>
            <button type="submit">Upload</button>
        </form>
        <?php if(!empty($palette)): ?>
            <h2>Image Data</h2>
            <h3>Dimensions: <?= $width ?>x<?= $height ?></h3>
            <h3>Unique Colors: <?= count($palette) ?></h3>
            <h3>Palette:</h3>
            <div style="display: flex; flex-wrap: wrap;">
                <?php foreach($palette as $hex => $count): ?>
                    <span class="swatch" style="background-color: #<?= $hex ?>;" title="<?= $count ?>"><?= $hex; ?> (<?= $count ?> pixels)</span>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </body>
</html>