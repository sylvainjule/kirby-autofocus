<?php

$router = new Router(array(
	array(
		'pattern' => '(:all)/ajax/get-safename',
		'method'  => 'POST',
		'filter'  => 'auth',
		'action'  => function() {

		    echo f::safeName($_POST["unsafeName"]);

        }
	),
	array(
		'pattern' => '(:all)/ajax/set-autofocus',
		'method'  => 'POST',
		'filter'  => 'auth',
		'action'  => function() {

		    $page = site()->index()->findBy('uid', $_POST["parent"]);
		    $image = $page->files()->get(f::safeName($_POST["filename"]));
		    $key = c::get('focus.field.key', 'focus');

		    $data = [$key => $_POST["coordinates"]];
		    $image->update($data);

        }
	),
));

$route = $router->run(kirby()->path());

if(is_null($route)) return;

$response = call($route->action(), $route->arguments());
exit;