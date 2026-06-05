<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$palette = [];
$image = null;
$width = $height = 0;

if(!empty($_FILES['image']['tmp_name'])) {
    $image = imagecreatefrompng($_FILES['image']['tmp_name']);
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