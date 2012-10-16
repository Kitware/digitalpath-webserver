

<?php

$lessonid = new MongoId();

$m = new Mongo();
$d = $m->selectDb('demo');
$c = $d->selectCollection('lessons');

$c->insert(array('_id'=>$lessonid));

echo json_encode($lessonid);

?>