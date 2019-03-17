# Kirby Autofocus

Content aware image cropping for kirby.

![screenshot-autofocus-k3](https://user-images.githubusercontent.com/14079751/47998289-15b0f100-e0ff-11e8-8865-0267db33660d.jpg)

<br/>

## Overview

> This plugin is completely free and published under the MIT license. However, if you are using it in a commercial project and want to help me keep up with maintenance, please consider [making a donation of your choice](https://www.paypal.me/sylvainjule) or purchasing your license(s) through [my affiliate link](https://a.paddle.com/v2/click/1129/36369?link=1170).

Autofocus is an extension for the [Focus plugin](https://github.com/flokosiol/kirby-focus).

This plugin acts as a JS `image.upload` hook, processing the / each image with the [focus component](https://github.com/component/focus), determining its appropriate focus point and saving it to the meta data file.

**Please note that :**

- This is an experimental plugin. The algorithm isn't foolproof, it works best with certain kinds of images, and obviously the more the context of an image is *« clear »*, the more its efficiency increases. I have included [a sample test with 30 images](https://github.com/sylvainjule/kirby-autofocus/blob/master/_test/test.md), as well as a way to run your own.
    
- The aim of this plugin is therefore to provide a *« better than nothing »* fallback to the Focus plugin whenever the editor didn't specify a focus point (omission, too many images, you name it).

- The plugin will only process images uploaded with the `files` section. It will not process replaced images. Suggestions welcome if you find a way to register a better hook.
    
<br/>

## Installation

> If you are looking to use this plugin with Kirby 2, please switch to the `kirby-2` branch.

First, you must install the [Focus plugin](https://github.com/flokosiol/kirby-focus).

> Note : the plugin would still work without it, but apart from adding the focus point to the .txt file, you wouldn't be able to preview / override / use it with the Focus methods.

Once it is done, download and copy this repository to ```/site/plugins/autofocus```

Alternatively, you can install it with composer: ```composer require sylvainjule/autofocus```

<br/>

## Usage

There's nothing else to do.

The plugin will now process any image you upload through the panel, find a focus point, and use the `flokosiol.focus.field.key` to write the coordinates. Then you can use the Focus plugin as you usually do.

<br/>

## Run tests

I have included [a sample test with 30 images](_test/test.md).

You can run you own tests to determine if the algorithm suits your needs. One simple way is to add the `focus` field in your blueprint, so that you can have a preview of where the focus is set for every image you upload.

An other way is to open the `index.html` of the `_test` folder in a browser, and upload an image.
The images used for calculation will be displayed on the page, as well as the coordinates in the console.

<br/>

## Credits

- [@flokosiol](https://github.com/flokosiol/) for his great help with this extension.
- The [focus component](https://github.com/component/focus) is used to determine the focus point on upload.

<br/>

## License

MIT