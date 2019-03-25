import Focus from '../vendors/focus.js'

export default function(Vue) {

	const original = Vue.options.components["k-files-section"]

	Vue.component('k-files-section', {
	    extends: original,
	    data() {
	    	return {
	    		firstLoad: true,
	    	}
	    }, 
	    watch: {
	    	data: {
	    		immediate: false,
	    		handler(newData, oldData) {
	    			// if there's no old data, it's been triggered while initializing
	    			if(this.isLoading) return false
	    			if(!oldData.length) {
	    				if(this.firstLoad) {
	    					this.firstLoad = false
	    					return false
	    				} 
	    			} 

	    			// compare the two arrays to check for new file(s)
			        let newFiles = newData.filter((el, index) => {
					    let match = oldData.filter((oldEl, index) => { return oldEl.filename == el.filename })
					    return !match.length
					})

			    	// if there's no new file
			    	if(!newFiles.length) return false

			    	if (FileReader) {
			    		this.findFocus(newFiles)
				    }  
	    		}
	    	}  
	    },
	    methods: {
	    	findFocus(files) {
	    		files.forEach(file => {
	    			let self = this

	    			var xhr = new XMLHttpRequest();
					    xhr.open('get', file.url);
					    xhr.responseType = 'blob';
					    xhr.onload = function(){
					        var fr = new FileReader();
					      	fr.onload = function(){
					            var _canvas = document.createElement('canvas'),
							        _ctx = _canvas.getContext('2d'),
							        _img = new Image;

							    _img.onload = function(){
							        var _w = _img.width,
							            _h = _img.height;

							        _canvas.width = _w;
							        _canvas.height = _h;

							        _ctx.drawImage(_img, 0, 0);

							        var _p = Focus(_canvas, { debug: false }),
							            _propX = _p.x / _w,
							            _propY = _p.y / _h,
							            _propX = (Math.round(_propX * 100)/100).toFixed(2),
							            _propY = (Math.round(_propY * 100)/100).toFixed(2),
							            coords = '{"x":'+ _propX +',"y":'+ _propY +'}';
							            
							        self.saveFocus(file, coords)
							    }
							    _img.src = fr.result;
					      	};
					      	fr.readAsDataURL(xhr.response);
					    };
					    xhr.send();
	    		})
	    	},
	    	saveFocus(file, coords) {
	    		this.$api.post('autofocus/save-focus', { uri: file.parent, filename: file.filename, coords: coords })
	    			.then(response => {
			        	// console.log(response)
			        })
			        .catch(error => {
			        	console.log(error)
			        })
	    	}
	    }
	})

}