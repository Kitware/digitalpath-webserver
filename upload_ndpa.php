<?php
# vim:tabstop=2:softtabstop=2:shiftwidth=2:noexpandtab

# Documentation
# Correct way of calling is 

# http://upload_ndpa.php

# When called with incorrect or unknown parameters returns a JSON with list of
# algorithms in list key. Also returns name = None to indicate that algorithm
# was not successfully returned

@$cmd = $_FILES["file"];

if(!isset($cmd))
	{
?>

<html>
<body>

<form action="upload_ndpa.php" method="post"
enctype="multipart/form-data">
<label for="file">Filename:</label>
<input type="file" name="file" id="file" />
<br />
<input type="submit" name="submit" value="Submit" />
</form>

</body>
</html> 


<?
	exit();	
	}

if ($_FILES["file"]["error"] > 0)
  {
  echo "Error: " . $_FILES["file"]["error"] . "<br />";
  }
else
  {
  echo "Upload: " . $_FILES["file"]["name"] . "<br />";
  echo "Type: " . $_FILES["file"]["type"] . "<br />";
  echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
  echo "Stored in: " . $_FILES["file"]["tmp_name"];
	
	# Analyze the XML file and follow python code
	try
		{
		$xml = simplexml_load_file($_FILES["file"]["tmp_name"]);
		echo $xml->asXML();
		}
	//catch exception
	catch(Exception $e)
		{
		echo 'Message: ' .$e->getMessage();
		}
  }
?>

