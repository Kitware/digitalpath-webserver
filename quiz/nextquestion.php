

<?php

$label = $_GET['label'];

$m = new Mongo();
$d = $m->selectDB("demo");
$c2 = $d->selectCollection("lesson");

$cursor = $c2->find()->sort(array('index'=>-1));
$image = $c2->findOne(array(imageid=>$label));

foreach($cursor as $obj){
	if($obj != $image){
		$nextimage = $obj;
	} else {
		break;
	}
}

if($nextimage){
	$nextindex = $nextimage['index'];
	$c2->update(array(index=>$nextindex), array('$set'=>array(index=>$image['index'])));
	$c2->update(array(imageid=>$label), array('$set'=>array(index=>$nextindex)));
}

header('Location: lessonmaker.php');

?>