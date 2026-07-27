<?php
    function menu_to_html($name, $item, $depth = 1) {
        if(strcmp($name, '---') === 0) return "<div class='menu_separator'></div>";

        $outer_start = $name;
        $outer_end = $inner = "";
        $props = "class='toolbar_item";
        
        if(!empty($item)):
            if(is_array($item)):
                if($depth <= 1):
                    $props .= " has_menu'";
                    $outer_start .= " <div class='toolbar_menu'>";
                else:
                    $props .= " has_submenu'";
                    $outer_start .= " <div class='toolbar_menu submenu'>";
                endif;
                $outer_end = "</div>";
                foreach($item as $subname => $subitem):
                    $inner .= menu_to_html($subname, $subitem, $depth + 1);
                endforeach;
            else:
                $props .= "' id='{$item}' data-action='{$item}'";
            endif;
        else:
            $props .= "'";
        endif;

        return "<div {$props}> {$outer_start} {$inner} {$outer_end} </div>";
    }