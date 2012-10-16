

<?php

$label = $_GET['label'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");

$cursor = $c2->find()->sort(array('index'=>1));
$image = $c2->findOne(array(imageid=>$label));

foreach($cursor as $obj){
	if($obj != $image){
		$previousimage = $obj;
	} else {
		break;
	}
}

if($previousimage){
	$previndex = $previousimage['index'];
	$c2->update(array(index=>$previndex), array('$set'=>array(index=>$image['index'])));
	$c2->update(array(imageid=>$label), array('$set'=>array(index=>$previndex)));
}

header('Location: lessonmaker.php');

?>