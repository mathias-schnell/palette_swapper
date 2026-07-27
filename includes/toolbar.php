<?php
    $toolbar = "<div id='toolbar' class='toolbar'>";
    foreach($toolbar_conf as $name => $item):
        $toolbar .= menu_to_html($name, $item);
    endforeach;
    $toolbar .= "<input type='file' id='source_upload' name='source_upload' hidden>";
    $toolbar .= "<input type='file' id='palette_upload' name='palette_upload' hidden>";
    $toolbar .= "</div>";

    echo $toolbar;
?>
