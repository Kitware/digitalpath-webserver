

<?php

$label = $_GET['label'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");

$c2->remove(array('imageid' => new MongoId($label)));

header('Location: lessonmaker.php');

?>