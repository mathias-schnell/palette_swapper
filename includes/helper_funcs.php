<?php
    function menu_to_html($name, $item, $depth = 1, $do_not_disable = []) {
        if(strcmp($name, '---') === 0) return "<div class='menu_separator'></div>";

        $outer_end = $inner = $id = $action = "";
        $outer_start = $name;
        $disabled = "true";
        $classes = Array("toolbar_item");
        
        if(!empty($item)):
            if(is_array($item)):
                $id = str_replace(" ", "_", strtolower($name)) . "_menu";
                if($depth <= 1):
                    $classes[] = "has_menu";
                    $outer_start .= " <div class='toolbar_menu'>";
                else:
                    $classes[] = "has_submenu";
                    $outer_start .= " <div class='toolbar_menu submenu'>";
                endif;
                $outer_end = "</div>";
                foreach($item as $subname => $subitem):
                    $inner .= menu_to_html($subname, $subitem, $depth + 1, $do_not_disable);
                endforeach;
            else:
                $id = str_replace(" ", "_", strtolower($item));
                $action = $item;
            endif;
        endif;
        $class_str = "class='" . implode(" ", $classes) . "'";

        if(in_array($action, $do_not_disable)):
            $disabled = "false";
        endif;

        return "<div {$class_str} id='{$id}' data-action='{$action}' aria-disabled='{$disabled}'> {$outer_start} {$inner} {$outer_end} </div>";
    }