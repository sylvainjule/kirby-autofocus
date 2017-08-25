# Kirby Autofocus

Content aware image cropping for kirby.

![screenshot-kirby-autofocus](https://user-images.githubusercontent.com/14079751/29251169-0c1c2c5a-8051-11e7-8f6d-18dd50ac44a8.jpg)


## Overview

Autofocus is an extension for the [Focus plugin](https://github.com/flokosiol/kirby-focus).

This plugin acts as a JS `image.upload` / `image.replace` hook, processing the / each image with the [focus component](https://github.com/component/focus), determining its appropriate focus point and saving it to the meta data file.

Please note that :

- This is an experimental plugin. The algorithm isn't foolproof, it works best with certain kinds of images, and obviously the more the context of an image is *« clear »*, the more its efficiency increases. I have included [a sample test with 30 images](https://github.com/sylvainjule/kirby-autofocus/blob/master/_test/test.md), as well as a way to run your own.

- The aim of this plugin is therefore  to provide a *« better than nothing »* fallback to the Focus plugin whenever the editor didn't specify a focus point (omission, too many images, you name it). 


## Installation

First, you must install the [Focus plugin](https://github.com/flokosiol/kirby-focus).

> Note : the plugin would still work without it, but apart from adding the focus point to the .txt file, you wouldn't be able to preview / override / use it with the Focus methods.

Once it is done, put the autofocus plugin in the `site/plugins` directory.  

The plugin folder must be named `autofocus` :

```
|-- site/plugins/
    |-- autofocus/
        |-- fields/
        |-- hooks/
        |-- routes/
        |-- autofocus.php
```

## Usage

There's nothing else to do.

The plugin will now process any image you upload through the panel, find a focus point, and use the Focus' field key to write the coordinates. Then you can use the Focus plugin as you usually do. 


## Run tests

I have included [a sample test with 30 images (1500px wide)](https://github.com/sylvainjule/kirby-autofocus/blob/master/_test/test.md).

You can run you own tests to determine if the algorithm suits your needs. One simple way is to add the `focus` field in your blueprint so that you can have a preview of where the focus is set for every image you upload.

An other way is to open the `index.html` of the `_test` folder in a browser, and upload an image. 
The images used for calculation will be displayed on the page, as well as the coordinates in the console.


## Credits

We worked on this extension together with [flokosiol](https://github.com/flokosiol/), many thanks for your time and great help ! 

Also, thanks to [texnixe](https://github.com/texnixe/) and [CodeStalker](https://github.com/CodeStalker/) for their help in the forum.

The [focus component](https://github.com/component/focus) is used to determine the focus point on upload.

 

## License

MIT
