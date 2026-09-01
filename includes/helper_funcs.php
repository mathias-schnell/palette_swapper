<?php
    function menu_to_html($name, $item, $depth = 0, $do_not_disable = []) {
        if($name === '---') return "<div class='menu_separator'></div>";

        if(is_array($item)):
            $html = "<div class='toolbar_group'>";
            $html .= "<button type='button' class='toolbar_item has_submenu' aria-expanded='false' aria-haspopup='true'> {$name} </button>";
            $html .= "<div class='toolbar_menu'>";
            foreach($item as $subname => $subitem):
                $html .= menu_to_html($subname, $subitem, $depth + 1, $do_not_disable);
            endforeach;
            $html .= "</div>";
            $html .= "</div>";
            return $html;
        endif;
        
        $disabled = (in_array($item, $do_not_disable) ? "" : "disabled");
        return "<button type='button' id='{$item}' class='toolbar_item menu_item' data-action='{$item}' {$disabled}> {$name} </button>";
    }