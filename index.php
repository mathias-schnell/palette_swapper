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
        <center>
            <form method="post" enctype="multipart/form-data">
                <input type="file" name="image" accept="image/png, image/gif, image/jpeg" required onchange="this.form.submit()">
            </form>
        </center>
        <div id="sidebar">
            <div class="sidebar_tabs">
                <div class="sidebar_tab" onclick="toggle_panel('image_panel')">🖼</div>
                <div class="sidebar_tab" onclick="toggle_panel('palette_panel')">🎨</div>
                <div class="sidebar_tab" onclick="toggle_panel('settings_panel')">⚙</div>
                <div class="sidebar_tab" onclick="toggle_panel('info_panel')">ℹ</div>
                <div class="sidebar_tab" onclick="toggle_panel('close_panel')">×</div>
            </div>
            <div id="image_panel" class="sidebar_panel">
                <?php if($src): ?>
                    Scale:
                    <input name="scale" readonly value="1">
                    <button type="button" onclick="adjust_scale(0.5)">+</button>
                    <button type="button" onclick="adjust_scale(-0.5)">-</button>
                <?php endif; ?>
            </div>
            <div id="palette_panel" class="sidebar_panel">
                <?php if($src): ?>
                    <?php if(!empty($palette)): ?>
                        <?php foreach($palette as $hex => $count): ?>
                            <div class="palette-row">
                                <span class="swatch" style="background-color: #<?= $hex ?>;"></span>
                                #<?= strtoupper($hex) ?>
                                <input type="color" value="#<?= $hex ?>" data-original="<?= $hex ?>" onchange="update_color_map(this)" />
                                (<?= $count ?> pixels)
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
            <div id="settings_panel" class="sidebar_panel"></div>
            <div id="info_panel" class="sidebar_panel"></div>
            <div id="close_panel" class="sidebar_panel" style="display: none;">×</div>
        </div>
        <img src="<?= $src ?>" id="source_image" name="source_image" alt="Source Image" />
        <div class="workspace">
            <div class="canvas_container">
                <canvas id="preview_canvas" name="preview_canvas"></canvas>
            </div>
        </div>
    </body>
</html>