<?php
	# To be called from facebook or google submodule
	require_once("config.php"); 
	# Create global mongo collection

	#$conn = new Mongo('mongodb://' . $_SESSION['loginConnName']);
	#$sessGroups = $conn->selectDB($_SESSION['loginDBName'])->selectCollection('groups');


	function get_memberships()
		{
		# Connects to the database and finds the groups that have been
		
		$conn = new Mongo();
		$colGroups = $conn->selectDB('slideatlas')->selectCollection('groups');
		$groups_list = array();
		
		# Reset the matching groups counter and 
		# corresponding permissions index

		$count = 0;
		$_SESSION['perm'] = array();

		foreach ($colGroups->find() as $sessDoc)
			{
			$in = 0;
			$match = array();

			foreach($_SESSION['groups'] as $key => $facebook_group)
				{
					#echo $facebook_group['name'] .  $facebook_group['id'] . " vs " . $sessDoc["facebook_id"] . " </br>";
					if($sessDoc['facebook_id'] == $facebook_group['id'])
					{
						$in = 1;
						$match = $facebook_group;
						
						# Add to the permissions information to the session cookie  
						# hence no groups information will be user in the cookie anymore

						# $_SESSION['host'] = $loginDBDoc['host'];
						# $_SESSION['book'] = $loginDBDoc['dbname'];
						# $_SESSION['copyright'] = $loginDBDoc['copyright'];
						# $_SESSION['auth'] = ($passwd == $loginDBDoc['adminpasswd']) ? 'admin' : 'student';
						$_SESSION['perm'][$count] = array("dbid" => $sessDoc['db'] , "facebook_id" => "dummy");
						break;
					}
				} 
			if($in == 1)
				{
				echo "<h3>" . $match["name"] . " </h3>";

				# Found a match
				$count = $count + 1;
					
				# Query the mentioned database and get the sessions names

				# Obtain the database 
				$coldb = $conn->selectDB('slideatlas')->selectCollection('databases');;
				$db = $coldb->findOne(array("_id" => $sessDoc["db"]));
				
				$conn2 = new Mongo($db['host']);				

				$colSessions = $conn2->selectDB($db["dbname"])->selectCollection("sessions");
					
				echo '<ul data-role="listview" data-inset="true">';

				foreach($sessDoc["can_see"] as $asession_id)
					{
						# Give a clickable list
						$asession_obj = $colSessions->findOne(array("_id" => $asession_id));
						echo '<li><a data-ajax="false" rel="external" href="access-session.php?sess=' , $asession_id, '&db=' , strval($count-1),'">' , $asession_obj['name'], '</a></li>' , "\n";
#						echo $asession_obj["name"] . " </br>";
					}
				print_r("</br>");
				}
			}

		# IF count is zero say some thing
		if($count == 0)
			{ 
			echo "</br> Sorry .. no sessions listed for you today </br>" , "\n";
			}
		}
	
		
		# Trim the irrelevant facebook groups and the fetched permissions 

	function display_user_information()
		{
		# Displays user information including group memberships 
		
		foreach ($_SESSION['facebook'] as $key => $val)
			{	
			echo $key . " " . $val . "</br>";
			} 

		foreach ($_SESSION['groups'] as $key => $val)
			{	
			echo $key . " " . $val['name'] . "</br>";
			} 
		}

	function display_available_groups()
		{
				#$access_groups = $conn->selectDB($database)->selectCollection('groups');



		}


	#display_user_information();

	# Loads the groups database, and lists the intersection
	# Cleans up session cookie
?>
	
<!DOCTYPE html>
<html>
	<head>
		<title>Slide Atlas</title>
		<meta charset='utf-8' />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
		<meta name = "viewport" content = "width = device-width">
		<link rel="apple-touch-icon" href="favicon.ico" />
		<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.css" />
		<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
		<script src="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.js"></script>
		<!-- large image specific additions  -->
		<link rel="stylesheet" href="css/mobile-map.css" type="text/css">
		<link rel="stylesheet" href="css/mobile-jq.css" type="text/css">
	</head>
	<body> 
		<!-- Index pages -->
		<div id="list" data-role="page">
			<div data-role="header">
				<h1>Slide Atlas</h1>
				<a href="" data-role="button" data-icon="gear" class='ui-btn-right' data-theme="<?php echo(($_SESSION['auth'] == 'admin') ? "b" : "a"); ?>">Options</a>
			</div><!-- /header -->

			<div data-role="content">
				<div id="banner">
					<h2>Session Index for <?php  echo $_SESSION['facebook']['name'] ?> </h2>
				</div>
				<p>This website is supported on multiple devices including iPad, iPhone and latest desktop browsers</p>

				<?php  
					
					#display_user_information();
					#display_available_groups();
					get_memberships();

				 ?>

				<ul data-role="listview" data-inset="true">
				<?php

#				# Loop through sessions
#				$conn = new Mongo('mongodb://' . $server);
#				$sessColl = $conn->selectDB($database)->selectCollection('sessions');
#
#				foreach ($sessColl->find()->sort(array('name' => 1)) as $sessDoc)
#					{
#					if (array_key_exists('label', $sessDoc))
#						{
#						$sessTitle = $sessDoc['label'];
#						}
#					else
#						{
#						$sessTitle = $sessDoc['name'];
#						}
#					echo '<li><a data-ajax="false" rel="external" href="session.php?sess=' , $sessDoc['_id'] , '">' , $sessTitle , '</a></li>' , "\n";
#					}
				?>
				</ul>
			</div><!-- /content -->
		</div><!-- /page -->
	</body>
</html>
-->
