<?php

class AutofocusField extends InputField {

  public $readonly = TRUE;

	static public $assets = array(
	    'js' => array(
	      'vendors/cookie.js',
	      'vendors/utilities.js',
	      'vendors/focus.js',
	      'autofocus.js',
	    )
	);

  // hide the input field
  public function element() {
    $element = new Brick('div');
    $element->addClass('field-name-' . $this->name);
    $element->addClass('hidden');
    return $element;
  }

}
