

<?php

$id = $_POST['qid'];
$title = $_POST['qtitle'];
$qtext = $_POST['qtext'];
$choices = $_POST['choices'];
$cam = $_POST['cam'];
$correct = $_POST['corr'];
$annots = $_POST['annotations'];
// How do we get the values store as floats rather than strings?
//$cam = json_decode($cam); did not work
//$cam.height = (float)$cam.height;
//$cam.roll = (float)$cam.roll;
//$cam.fp[0] = (float)$cam.fp[0];
//$cam.fp[1] = (float)$cam.fp[1];
//$cam.fp[2] = (float)$cam.fp[2]; did not work either

$m = new Mongo();
$d = $m->selectDb('demo');
$c3 = $d->selectCollection('questions');

$choices2 = array();

for($i = 0; $i < count($choices); $i++){
    if($choices[$i] != ""){
        array_push($choices2, $choices[$i]);
    }
}

//$mod = $c3->find(array('_id'=>new MongoId($id)));

//$mod['qtext'] = $qtext;
//$mod['choices'] = $choices;

//$imgid = $c3->findOne(array('_id'=>new MongoId($id)), array('imageid'=>1));

if($annots == 0){
    $annots = array();
}

$c3->update(array('qid'=>new MongoId($id)), array('$set'=>array('qtext'=>$qtext, 'title'=>$title, 'choices'=>$choices2, 'cam'=>$cam, 'correct'=>$correct, 'annotations'=>$annots)), true);

echo json_encode($choices);

?>