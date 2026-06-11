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
        <script type="text/javascript" src="assets/js/main.js" defer></script>
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
                <button onclick="adjust_scale(0.5)">+</button>
                <button onclick="adjust_scale(-0.5)">-</button>
            </h4>
            <img src="<?= $src ?>" id="source_image" name="source_image" alt="Source Image" style="display: none;" />
            <canvas id="preview_canvas" name="preview_canvas"></canvas>
            <h4>Dimensions: <?= $width ?>x<?= $height ?></h4>
        <?php endif; ?>
        <?php if(!empty($palette)): ?>
            <div>
                <?php foreach($palette as $hex => $count): ?>
                    <div class="palette-row">
                        <span class="swatch" style="background-color: #<?= $hex ?>;"></span>
                        #<?= strtoupper($hex) ?>
                        <input type="color" value="#<?= $hex ?>" data-original="<?= $hex ?>" onchange="update_color_map(this)" />
                        (<?= $count ?> pixels)
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </body>
</html>