

<?php

$lessonid = $_GET['lid'];
$name = $_GET['name'];

$m = new Mongo();
$d = $m->selectDb("demo");
$c = $d->selectCollection("lessons");

$c->update(array('_id'=>new MongoId($lessonid)), array('name'=>$name), true);

?>