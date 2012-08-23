

<?php

$lessonid = $_GET['lid'];

$m = new Mongo();
$d = $m->selectDb('demo');
$c = $d->selectCollection('lessons');

$c->remove(array('_id'=>new MongoId($lessonid)));

?>