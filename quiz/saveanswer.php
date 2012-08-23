

<?php

$lessonid = $_GET['lid'];
$index = $_GET['index'];
$answer = $_GET['checked'];

/*
503619b9064274a029000012
*/

setcookie(''+$lessonid+$index,$answer);

?>