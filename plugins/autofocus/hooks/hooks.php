<?php

$kirby->hook(['panel.file.upload', 'panel.file.replace'], function($file) {

    // If that's an image
    if ($file->type() == 'image') {

        $name = $file->name();
        $extension = $file->extension();

        $filename = $name . '.' . $extension;

        // Set the cookie for 60 sec
        setcookie($filename, true, time()+60);

    }

});