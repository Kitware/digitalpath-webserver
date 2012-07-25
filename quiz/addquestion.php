

<?php

$label = $_GET['label'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");

$cursor = $c2->find()->sort(array('index'=>-1))->limit(1);
foreach($cursor as $obj){
	$lastindex = $obj['index'];
}

if(!$lastindex){
$lastindex=0;
}

$c2->insert(array(
	'imageid' => new MongoId($label),
	'index' => ($lastindex+1)
	));

header('Location: lessonmaker.php');

?>