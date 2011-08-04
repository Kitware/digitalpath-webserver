<?php
# vim:tabstop=2:softtabstop=2:shiftwidth=2:noexpandtab

# Documentation
# Correct way of calling is 

# http://upload_ndpa.php

# When called with incorrect or unknown parameters returns a JSON with list of
# algorithms in list key. Also returns name = None to indicate that algorithm
# was not successfully returned

# Report all PHP errors (see changelog)
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors','On'); 

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
  echo "Stored in: " . $_FILES["file"]["tmp_name"] . ",br/>";
	
	# Analyze the XML file and follow python code
	try
		{
		$xml = simplexml_load_file($_FILES["file"]["tmp_name"]);
		
		$bookmarks = array();	
		# Browse through the bookmarks and list them
		foreach ($xml->children() as $elem) 
			{
			$bookmark = array();
			$bookmark['title'] = (string) $elem->title;
			$bookmark['details'] = (string) $elem->details;
			$bookmark['center'] = array( intval($elem->x), intval($elem->y), intval($elem->z));
			$bookmark['lens'] = floatval((string)$elem->lens);

			$annot  = array();
			$points = array();
			$apoint = array();

			foreach($elem->annotation->attributes() as $name=>$value)
				{
					$annot[$name] = (string) $value;
				}
			$isx = 1;
			
			foreach($elem->annotation->children() as $child)
				{
				switch($child->getName())
					{
					case 'pointlist':
						foreach($child->children() as $coords)
							{
							$points[] = array(intval($coords->x), intval($coords->y));
							}
						break;

					case 'measuretype':
						$annot['measuretype'] = intval($child);
						break;

					case 'closed':
						$annot['closed'] = intval($child);
						break;
					
					case 'radius':
						$annot['radius'] = intval($child);
						break;

					case 'specialtype':
						$annot['specialtype'] = (string) $child;
						break;
					
					default:
						if($isx)
							{
							$isx = 0;
							$apoint[0] = intval($child);
							}
						else
							{
							$isx = 1;
							$apoint[1] = intval($child);
							$points[] = $apoint;
							}
							break;
					}
				}
			$annot['points'] = $points;
			$bookmark['annotation'] = $annot; 
			$bookmarks[] = $bookmark;	
			}
		echo "<pre> ";
		print_r($bookmarks);
		echo "</pre>";
		}
	//catch exception
	catch(Exception $e)
		{
		echo 'Message: ' .$e->getMessage();
		}
  }
?>

