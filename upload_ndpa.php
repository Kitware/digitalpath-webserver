<?php
# vim:tabstop=2:softtabstop=2:shiftwidth=2:noexpandtab

# Documentation
# Correct way of calling is 

# http://upload_ndpa.php

# When called with incorrect or unknown parameters returns a JSON with list of
# algorithms in list key. Also returns name = None to indicate that algorithm
# was not successfully returned

# Report all PHP errors (see changelog)
require_once("config.php"); 

@$cmd = $_FILES["file"];
@$image_id = trim($_POST['image_id']);
$ref = $_SERVER['HTTP_REFERER'];

if(!isset($cmd) || !isset($image_id))
{
	echo("File and Destination image ID required for processing"); 
	return;
}


if ($_FILES["file"]["error"] > 0)
  {
  echo("<!doctype html>");
  echo "Error: " . $_FILES["file"]["error"] . "<br />";
  return;
  }
else
  {
	# echo "Upload: " . $_FILES["file"]["name"] . "<br />";
  # echo "Type: " . $_FILES["file"]["type"] . "<br />";
  # echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
  # echo "Stored in: " . $_FILES["file"]["tmp_name"] . ",br/>";
	
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
		# Ready for uplaod
		# Perform database initialization and get chapter name

		# connect
		$m = new Mongo($server, array('persist' => 'path'));
		
		# select a collection (analogous to a relational database's table)
		$collection = $m->selectDB($database)->selectCollection("images"); 

		# Perform the query to get chapter name
		$oid = new MongoId($image_id);
		
		$collection->update( array( "_id" => $oid), array('$set' => array("bookmarks" => $bookmarks)));
		
		$headstring =trim( 'location: image.php?id='. $image_id . "#mapppage");
//		header( 'location:'.$ref);
		header($headstring);
//		echo("<a href =\"" . $headstring ."\" >");
//		echo($headstring);
//		echo("</a>");

		# Now upload the annotations into some database already opened
		
		# Have the image object now in $cursor
		$obj = $collection->findOne(array( "_id" => $oid));
		echo $image_id . "<br/>";	
		echo "<pre> ";
		print_r($obj);
		echo "</pre>";
		echo("<a href =\"image.php?id=" .$image_id ."#mappage\" >");
		echo("Go back");
		echo("</a>");
		header( 'location:'.$ref);

		# Output success
		}
	//catch exception
	catch(Exception $e)
		{
		echo 'Error !!';
		echo 'Message: ' .$e->getMessage();
		return;
		}
  }
?>
