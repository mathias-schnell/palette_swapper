<?php

require_once 'includes/error_conf.php';
require_once 'includes/helper_funcs.php';
require_once 'includes/image_proc.php';

$image_data = process_uploaded_image();
extract($image_data);

?>

<!doctype html>
<html>
    <head>
        <title>Palette Swapper</title>
        <script type="text/javascript" src="assets/js/main.js"></script>
        <link rel="stylesheet" href="assets/css/reset.css">
        <link rel="stylesheet" href="assets/css/main.css">
    </head>
    <body>
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