<?php
require_once 'includes/error_conf.php';
require_once 'includes/helper_funcs.php';

$source_data = process_image($_FILES['source_image'] ?? null);
$target_data = process_image($_FILES['target_image'] ?? null);
extract($source_data, EXTR_PREFIX_ALL, 'source');
extract($target_data, EXTR_PREFIX_ALL, 'target');
$palette_map = generate_palette_map($source_palette, $target_palette);
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
        <div id="sidebar" class="sidebar">
            <div id="sidebar_panel_container" class="sidebar_panel_container">
                <div id="image_panel" class="sidebar_panel">
                    <form method="post" enctype="multipart/form-data">
                        <label for="image_upload" class="upload_button">
                            Source Image
                            <input type="file" id="image_upload" name="source_image" hidden>
                        </label>
                        <br /><br />
                        <label for="target_image" class="upload_button">
                            Target Palette
                            <input type="file" id="target_image" name="target_image" hidden>
                        </label>
                        <br /><br />
                        <input type="submit" value="Upload" />
                    </form>
                    <?php if($source_src): ?>
                        <h2>Scale</h2>
                        <p>
                            <input name="scale" readonly value="1.0">
                            <button type="button" onclick="adjust_scale(0.5)">+</button>
                            <button type="button" onclick="adjust_scale(-0.5)">-</button>
                        </p>
                    <?php endif; ?>
                </div>
                <div id="palette_panel" class="sidebar_panel">
                    <?php if($source_src): ?>
                        <?php if(!empty($source_palette)): ?>
                            <button id="apply_new_palette" onclick="update_color_map()">Apply New Palette</button><br /><br />
                            <button id="reset_palette" onclick="reset_color_map()">Reset Palette</button><br /><br />
                            <h2>Color Palette</h2>
                            <?php if(!empty($target_palette && !empty($palette_map))): ?>
                                <?php foreach($source_palette as $source_hex => $count): ?>
                                    <div class="palette_row" data-source="<?= $source_hex ?>" data-target="<?= $palette_map[$source_hex] ?>">
                                        <span class="swatch" style="background:#<?= $source_hex ?>"></span>
                                        →
                                        <span class="swatch" style="background:#<?= $palette_map[$source_hex] ?>"></span>
                                        #<?= strtoupper($source_hex) ?>
                                        →
                                        #<?= strtoupper($palette_map[$source_hex]) ?>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <?php foreach($source_palette as $source_hex => $count): ?>
                                    <div class="palette_row">
                                        <span class="swatch" style="background:#<?= $source_hex ?>"></span>
                                        #<?= strtoupper($source_hex) ?>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
                <div id="info_panel" class="sidebar_panel">
                    <?php if($source_src): ?>
                        <h2>Dimensions</h2>
                        <p><?= $source_width ?>px × <?= $source_height ?>px</p>

                        <h2>Unique Colors</h2>
                        <p><?= count($source_palette) ?></p>
                    <?php endif; ?>
                </div>
            </div>
            <div class="sidebar_tabs">
                <div class="sidebar_tab" data-tooltip="Image Settings" onclick="open_sidebar('image_panel')">🖼</div>
                <div class="sidebar_tab" data-tooltip="Color Palette" onclick="open_sidebar('palette_panel')">🎨</div>
                <div class="sidebar_tab" data-tooltip="Image Info" onclick="open_sidebar('info_panel')">ℹ</div>
                <div class="sidebar_tab" data-tooltip="Close" onclick="close_sidebar()">×</div>
            </div>
        </div>
        <?php if($source_src): ?>
            <img src="<?= $source_src ?>" id="source_image" name="source_image" alt="Source Image" />
            <div class="workspace">
                <div class="canvas_container">
                    <canvas id="preview_canvas" name="preview_canvas"></canvas>
                </div>
            </div>
        <?php endif; ?>
        <div id="tooltip"></div>
    </body>
</html>