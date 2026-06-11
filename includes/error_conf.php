<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!extension_loaded('gd')) die("GD extension is not enabled. Enable GD in PHP to process images.");