

<?php

$new = $_POST['qlist'];
$lessonid = $_POST['lid'];

$m = new Mongo();
$d = $m->selectDb('demo');
$c2 = $d->selectCollection("lessons");

/*$lesson = $c2->findOne(array('lessonid'=>$lessonid));

$length = count($new);

for($i = 0; $i < $length; $i++){
    $lesson['questions'][$i] = $new[$i];
}*/
for($i=0;$i < count($new); $i++){
    $new[$i] = new MongoId($new[$i]);
}

$c2->update(array('_id'=>new MongoId($lessonid)), array('$set'=>array('questions'=>$new)), true);
?>