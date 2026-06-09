<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!extension_loaded('gd')):
    die("GD extension is not enabled. Enable GD in PHP to process images.");
endif;

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

$palette = [];
$image = null;
$src = null;
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

    $src = 'data:' . $image_info['mime'] . ';base64,' . base64_encode(file_get_contents($_FILES['image']['tmp_name']));
}

if($image):
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
endif;

?>

<!doctype html>
<html>
    <head>
        <title>Palette Swapper</title>
        <script type="text/javascript">
            function updateImageScale() {
                const scaleInput = document.querySelector('input[name=scale]');
                const uploadedImage = document.querySelector('img[name=uploadedImage]');
                if (uploadedImage) {
                    const originalWidth = <?= $width ?>;
                    const originalHeight = <?= $height ?>;
                    const scale = parseFloat(scaleInput.value);
                    uploadedImage.style.width = (originalWidth * scale) + 'px';
                    uploadedImage.style.height = (originalHeight * scale) + 'px';
                }
            }

            function adjustScale(delta) {
                const scaleInput = document.querySelector('input[name=scale]');
                let currentScale = parseFloat(scaleInput.value);
                currentScale = Math.max(1.0, Math.min(5.0, currentScale + delta));
                scaleInput.value = currentScale.toFixed(1);
                updateImageScale();
            }
        </script>
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
        <?php if($src): ?>
            <h3>Uploaded Image</h3>

            <h4>
                Scale: 
                <input name="scale" readonly value="1" style="width: 25px; text-align: center;"> 
                <button onclick="adjustScale(0.5)">+</button>
                <button onclick="adjustScale(-0.5)">-</button>
            </h4>

            <img
                src="<?= $src ?>"
                name="uploadedImage"
                alt="Uploaded Image"
                style="border: 1px solid #000; image-rendering: pixelated;"
            />

            <h4>Dimensions: <?= $width ?>x<?= $height ?></h4>
        <?php endif; ?>
        <?php if(!empty($palette)): ?>
            <div>
                <?php foreach($palette as $hex => $count): ?>
                    <span class="swatch" style="background-color: #<?= $hex ?>;" title="<?= $count ?>"></span> <?= "#" . strtoupper($hex); ?> (<?= $count ?> pixels)<br />
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </body>
</html>