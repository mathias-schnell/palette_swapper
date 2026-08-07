<?php require_once 'includes/error_conf.php'; ?>
<?php require_once 'includes/app_conf.php'; ?>
<?php require_once 'includes/helper_funcs.php'; ?>
<!doctype html>
<html>
    <head>
        <title>Palette Swapper</title>
        <script type="module" src="assets/js/main.js"></script>
        <link rel="stylesheet" id="reset_css" href="assets/css/reset.css">
        <link rel="stylesheet" id="main_css" href="assets/css/main.css">
        <?php if($demo_mode): ?>
            <link rel="stylesheet" id="demo_css" href="assets/css/demo.css">
        <?php endif; ?>
    </head>
    <body>
        <?php include_once 'includes/toolbar.php'; ?>
        <?php include_once 'includes/sidebar.php'; ?>
        <?php include_once 'includes/history.php'; ?>
        <?php include_once 'includes/workspace.php'; ?>
    </body>
</html>