

<?php

$label = $_GET['label'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");

$cursor = $c2->find()->sort(array('index'=>1))->limit(1);
$image = $c2->findOne(array(imageid=>$label));

foreach($cursor as $obj){
	$firstimage = $obj;
	$firstindex = $obj['index'];
}

if($firstimage != $image){
	$c2->update(array(index=>$firstindex), array('$set'=>array(index=>$image['index'])));
	$c2->update(array(imageid=>$label), array('$set'=>array(index=>$firstindex)));
}

header('Location: lessonmaker.php');

?>