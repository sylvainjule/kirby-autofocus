<?php

Kirby::plugin('sylvainjule/autofocus', array(
	'options' => array(
		'key'      => 'focus',
	),
	'api'    => require_once __DIR__ . '/lib/api.php',
));