<?php

return array(
	'routes' => array(
		array(
	        'pattern' => 'autofocus/save-focus',
	        'method'  => 'POST',
	        'action'  => function() {
	        	// get coordinates, find page
	        	$filename = get('filename');
	            $uri      = get('uri');

	            // from pages/first-level+second-level
	            // to   first-level/second-level
	            $uri      = str_replace('+', '/', $uri);
	            $uri      = preg_replace('/^pages\//', '', $uri);

	            $coords   = get('coords');
	            $page     = kirby()->page($uri);
	            $file     = $page->file($filename);
	            $key      = option('flokosiol.focus.field.key', 'focus');

	        	try {
	        		if($file->content()->get($key)->isEmpty() || $file->content()->get($key) == '{"x":0.5,"y":0.5}') {
		        		$file->update(array($key => $coords));
		        		return array('status' => 'success');
		        	}
		        	else {
		        		return array('status' => 'not-empty');
		        	}
	        	}
	        	catch (Exception $e) {
	        		$response = array(
			            'status' => 'error',
			            'message'  => $e->getMessage()
			        );
			        return $response;
	        	}
	        }
	    ),
	)
);