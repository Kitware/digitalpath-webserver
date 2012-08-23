

<?php

$m = new Mongo();
$d = $m->selectDb('demo');
$c = $d->selectCollection('lessons');

$lessons = $c->find();

$larr = array();

foreach($lessons as $l){
    array_push($larr, $l);
}

echo json_encode($larr);

?>