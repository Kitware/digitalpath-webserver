<?php

session_start();

# Make sure that required variables are set

# Perform database initialization
@$idx_db =  $_REQUEST['db'];
@$id_sess = $_REQUEST['sess'];

if(isset($idx_db))
{
	$id_db = $_SESSION['perm'][$idx_db]['dbid'];
}
else
{

header('location:index.php');
}

$conn = new Mongo();
$col_db = $conn->selectDB('slideatlas')->selectCollection("databases");
$obj_db = $col_db->findOne( array("_id" => new MongoId($id_db)) );

# Assuming that the db is found 

# Now get the server information and put it in the cookie

$_SESSION['host'] = $obj_db['host'];
$_SESSION['book'] = $obj_db['dbname'];
$_SESSION['copyright'] = $obj_db['host'];
$_SESSION['auth'] = 'student';

header('location:session.php?sess=' . $id_sess);
?>
