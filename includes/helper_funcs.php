<?php
    function menu_to_html($name, $item, $depth = 0, $do_not_disable = []) {
        if(strcmp($name, '---') === 0) return "<div class='menu_separator'></div>";

        $outer_end = $inner = $id_str = $action_str = $type_str = "";
        $outer_start = $name;
        $disabled_str = "aria-disabled='true'";
        $classes = Array("toolbar_item");
        $tag = "div";
        
        if(!empty($item)):
            if(is_array($item)):
                $id = str_replace(" ", "_", strtolower($name)) . "_menu";
                if($depth <= 0):
                    $classes[] = "has_menu";
                    $outer_start .= " <div class='toolbar_menu'>";
                else:
                    $classes[] = "has_submenu";
                    $outer_start .= " <div class='toolbar_menu submenu'>";
                endif;
                $outer_end = "</div>";
                foreach($item as $subname => $subitem):
                    $inner .= " " . menu_to_html($subname, $subitem, $depth + 1, $do_not_disable);
                endforeach;
            else:
                $id_str = "id='" . str_replace(" ", "_", strtolower($item)) . "'";
                $action_str = $item;
                $tag = "button";
            endif;
        endif;

        if(in_array($action_str, $do_not_disable) || $depth <= 0):
            if($tag == "button"):
                $disabled_str = "";
            else:
                $disabled_str = "aria-disabled='false'";
            endif;
        else:
            if($tag == "button"):
                $disabled_str = "disabled";
            endif;
        endif;

        $action_str = ($action_str ? "data-action='{$action_str}'" : "");
        $class_str = "class='" . implode(" ", $classes) . "'";

        return "<{$tag} {$type_str} {$class_str} {$id_str} {$action_str} {$disabled_str}> {$outer_start} {$inner} {$outer_end} </{$tag}>";
    }