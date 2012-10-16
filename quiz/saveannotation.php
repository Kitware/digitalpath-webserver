

<?php

$widget = $_POST['widget'];
$id = $_GET['id'];

$id = new MongoId($id);

$m = new Mongo();
$d = $m->selectDb("demo");
$c = $d->selectCollection("questions");

$q = $c->findOne(array('qid'=>$id));
if(isset($q['annotations'])){
    $annots = $q['annotations'];
} else {
    $annots = array();
}

array_push($annots, $widget);

$c->update(array('qid'=>$id), array('$set'=>array(
        'annotations'=>$annots
        )), true);

?>