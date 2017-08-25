/* Detect an upload
------------------------*/

// Detect a file upload, find if it's an image, and loop through every image
$(document).on('change', 'input[type=file]', function() {

    var files = this.files;

    var _url = window.location.href,
        _uri = getUri(_url);

    // Extract the file name if we're on the file page
    if (_url.indexOf('/file/') != -1) {
        var _getFilename = /(?!\/)([A-Z0-9_-]{1,}\.(?:png|jpg|jpeg))/g;
        var _name = _getFilename.exec(_url),
            _name = _name ? _name[1] : false;
    }

    // FileReader support
    if (FileReader && files && files.length) {
        // Loop through every file
        for (var i = 0; i < files.length; i++) {
            (function(file) {
                var fr = new FileReader();
                var _filename = _name ? _name : file.name;

                // If that's an image
                if (_filename.match(/(jpg|jpeg|png)/)) {
                    fr.onload = function() {  
                        returnPos(fr.result, _filename, _uri);
                    }
                    fr.readAsDataURL(file);
                }
                
            })(files[i]);
        }
    }   
});

var getUri = function(_url) {

    var _uri = '';

    // if we're on the main page
    if (_url.indexOf('/file/') == -1 && _url.indexOf('/files') == -1) {
        _uri = _url.replace('/edit', ''),
        _uri = _uri.split('/').slice(-1)[0];
    }
    // if we're on the files index
    else if (_url.indexOf('/files') != -1) {
        _uri = _url.replace('/files', ''),
        _uri = _uri.split('/').slice(-1)[0];
    }
    // if we're on the file page
    else if (_url.indexOf('/file/') != -1) {
        _uri = _url.replace(/(?:\/file\/)(?:[0-9]|[a-z]|[\.\-])+(?:\/edit)/, ''),
        _uri = _uri.split('/').slice(-1)[0];
    }

    return _uri;

}

/* Ajax POST the coordinates
-----------------------------*/

// Get the focus point position and trigger the ajax to add it in the file
var returnPos = function(file, filename, uri) {
    var _canvas = $('<canvas/>')[0],
        _ctx = _canvas.getContext('2d'),
        _img = new Image;
        _img.src = file;

    _img.onload = function(){
        var _w = _img.width,
            _h = _img.height;

        _canvas.width = _w;
        _canvas.height = _h;

        _ctx.drawImage(_img, 0, 0);

        var _p = focus(_canvas, { debug: false }),
            _propX = _p.x / _w,
            _propY = _p.y / _h,
            _propX = (Math.round(_propX * 100)/100).toFixed(2),
            _propY = (Math.round(_propY * 100)/100).toFixed(2),
            _coordinates = '{"x":'+ _propX +',"y":'+ _propY +'}';


		/* Get the safe name
		-----------------------------*/

		$.ajax({
            type: 'post',
            url: 'ajax/get-safename',
            data: {unsafeName: filename},
            tryCount : 0,
            success: function(safeName) {
            	filename = safeName;
            	waitForUpload();
            },
            error: function (xhr, ajaxOptions, thrownError) {}
        });


        /* Wait for the upload to be completed
		-----------------------------*/

        function waitForUpload(){
		    if (typeof Cookies.get(filename) !== "undefined") {
		        Cookies.remove(filename, { path: '' });
		        postCoordinates();
		    }
		    else {
		        setTimeout(waitForUpload, 500);
		    }
		}


		/* Ajax POST the coordinates
		-----------------------------*/

        function postCoordinates() {

        	var data = {
	            parent: uri,
	            filename: filename,
	            coordinates: _coordinates
	        };

    		$.ajax({
	            type: 'post',
	            url: 'ajax/set-autofocus',
	            data: data,
	            tryCount : 0,
	            success: function(data) {},
	            error: function (xhr, ajaxOptions, thrownError) {}
	        });

        }
        
        
    }
}


/* JS safeName()
-----------------------------*/


//    var _name = filename.substr(0, filename.lastIndexOf('.')),
//	      _extension = '.' + filename.substr(filename.lastIndexOf('.'), filename.length);
//
//    _name = safeName(_name);


function safeName(filename) {
	filename = filename.trim(); // trim first and last whitespace
	filename = filename.toLowerCase(); // convert the whole string to lowercase
	filename = toAscii(filename); // convert the special characters
	filename = filename.replace(/\s+/g, '-'); // whitespaces -> hyphens
	filename = filename.replace(/[^a-z0-9@._-\s]/gi, '-'); // replace the special characters to hyphens
	filename = filename.replace(/-{2,}/g, '-'); // avoid multiple hyphens
	filename = ltrim('-', filename); // avoid hyphen at the beggining of the string
	filename = rtrim('-', filename); // avoid hyphen at the end of the string

	return filename;

	function ltrim(char, str) {
	    if (str.slice(0, char.length) === char) {
	        return ltrim(char, str.slice(char.length));
	    } else {
	        return str;
	    }
	}
	function rtrim(char, str) {
	    if (str.slice(str.length - char.length) === char) {
	        return rtrim(char, str.slice(0, 0 - char.length));
	    } else {
	        return str;
	    }
	}
}

function toAscii(str) {

	str = JSON.parse(JSON.stringify(str));

	str = str.replace(/Ä/g, 'Ae');
    str = str.replace(/æ|ǽ|ä/g, 'ae');
    str = str.replace(/À|Á|Â|Ã|Å|Ǻ|Ā|Ă|Ą|Ǎ|А/g, 'A');
    str = str.replace(/à|á|â|ã|å|ǻ|ā|ă|ą|ǎ|ª|а/g, 'a');
    str = str.replace(/Б/g, 'B');
    str = str.replace(/б/g, 'b');
    str = str.replace(/Ç|Ć|Ĉ|Ċ|Č|Ц/g, 'C');
    str = str.replace(/ç|ć|ĉ|ċ|č|ц/g, 'c');
    str = str.replace(/Ð|Ď|Đ/g, 'Dj');
    str = str.replace(/ð|ď|đ/g, 'dj');
    str = str.replace(/Д/g, 'D');
    str = str.replace(/д/g, 'd');
    str = str.replace(/È|É|Ê|Ë|Ē|Ĕ|Ė|Ę|Ě|Е|Ё|Э/g, 'E');
    str = str.replace(/è|é|ê|ë|ē|ĕ|ė|ę|ě|е|ё|э/g, 'e');
    str = str.replace(/Ф/g, 'F');
    str = str.replace(/ƒ|ф/g, 'f');
    str = str.replace(/Ĝ|Ğ|Ġ|Ģ|Г/g, 'G');
    str = str.replace(/ĝ|ğ|ġ|ģ|г/g, 'g');
    str = str.replace(/Ĥ|Ħ|Х/g, 'H');
    str = str.replace(/ĥ|ħ|х/g, 'h');
    str = str.replace(/Ì|Í|Î|Ï|Ĩ|Ī|Ĭ|Ǐ|Į|İ|И/g, 'I');
    str = str.replace(/ì|í|î|ï|ĩ|ī|ĭ|ǐ|į|ı|и/g, 'i');
    str = str.replace(/Ĵ|Й/g, 'J');
    str = str.replace(/ĵ|й/g, 'j');
    str = str.replace(/Ķ|К/g, 'K');
    str = str.replace(/ķ|к/g, 'k');
    str = str.replace(/Ĺ|Ļ|Ľ|Ŀ|Ł|Л/g, 'L');
    str = str.replace(/ĺ|ļ|ľ|ŀ|ł|л/g, 'l');
    str = str.replace(/М/g, 'M');
    str = str.replace(/м/g, 'm');
    str = str.replace(/Ñ|Ń|Ņ|Ň|Н/g, 'N');
    str = str.replace(/ñ|ń|ņ|ň|ŉ|н/g, 'n');
    str = str.replace(/Ö/g, 'Oe');
    str = str.replace(/œ|ö/g, 'oe');
    str = str.replace(/Ò|Ó|Ô|Õ|Ō|Ŏ|Ǒ|Ő|Ơ|Ø|Ǿ|О/g, 'O');
    str = str.replace(/ò|ó|ô|õ|ō|ŏ|ǒ|ő|ơ|ø|ǿ|º|о/g, 'o');
    str = str.replace(/П/g, 'P');
    str = str.replace(/п/g, 'p');
    str = str.replace(/Ŕ|Ŗ|Ř|Р/g, 'R');
    str = str.replace(/ŕ|ŗ|ř|р/g, 'r');
    str = str.replace(/Ś|Ŝ|Ş|Ș|Š|С/g, 'S');
    str = str.replace(/ś|ŝ|ş|ș|š|ſ|с/g, 's');
    str = str.replace(/Ţ|Ț|Ť|Ŧ|Т/g, 'T');
    str = str.replace(/ţ|ț|ť|ŧ|т/g, 't');
    str = str.replace(/Ü/g, 'Ue');
    str = str.replace(/ü/g, 'ue');
    str = str.replace(/Ù|Ú|Û|Ũ|Ū|Ŭ|Ů|Ű|Ų|Ư|Ǔ|Ǖ|Ǘ|Ǚ|Ǜ|У/g, 'U');
    str = str.replace(/ù|ú|û|ũ|ū|ŭ|ů|ű|ų|ư|ǔ|ǖ|ǘ|ǚ|ǜ|у/g, 'u');
    str = str.replace(/В/g, 'V');
    str = str.replace(/в/g, 'v');
    str = str.replace(/Ý|Ÿ|Ŷ|Ы/g, 'Y');
    str = str.replace(/ý|ÿ|ŷ|ы/g, 'y');
    str = str.replace(/Ŵ/g, 'W');
    str = str.replace(/ŵ/g, 'w');
    str = str.replace(/Ź|Ż|Ž|З/g, 'Z');
    str = str.replace(/ź|ż|ž|з/g, 'z');
    str = str.replace(/Æ|Ǽ/g, 'AE');
    str = str.replace(/ß/g, 'ss');
    str = str.replace(/Ĳ/g, 'IJ');
    str = str.replace(/ĳ/g, 'ij');
    str = str.replace(/Œ/g, 'OE');
    str = str.replace(/Ч/g, 'Ch');
    str = str.replace(/ч/g, 'ch');
    str = str.replace(/Ю/g, 'Ju');
    str = str.replace(/ю/g, 'ju');
    str = str.replace(/Я/g, 'Ja');
    str = str.replace(/я/g, 'ja');
    str = str.replace(/Ш/g, 'Sh');
    str = str.replace(/ш/g, 'sh');
    str = str.replace(/Щ/g, 'Shch');
    str = str.replace(/щ/g, 'shch');
    str = str.replace(/Ж/g, 'Zh');
    str = str.replace(/ж/g, 'zh');

	return str;
}
