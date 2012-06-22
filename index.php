<?php
# Move these to index.php config file?
$loginConnName = 'ayodhya:27017';
$loginDBName = 'slideatlas';

# Logging in with Google $accounts requires setting special identity, so this example shows how to do it.
require 'protected/openid.php';

@$databaseId = $_REQUEST['database'];
@$passwd = $_REQUEST['passwd'];
$openid = new LightOpenID('ayodhya:82');

# First see if OpenID login is called
if(!$openid->mode)
	{
	if(isset($_REQUEST['login']))
		{
		$openid->identity = 'https://www.google.com/accounts/o8/id';
		$openid->required = array('namePerson/friendly', 'contact/email'); $openid->optional = array('namePerson/first');
		// Send the user to authorizing application
		header('Location: ' . $openid->authUrl());
		return;
		}
	}
elseif($openid->mode != 'cancel')
	{
	$arr = $openid->getAttributes();
	if($openid->validate())
		{
			session_destroy();
			session_start();
			$_SESSION['name'] = $arr['contact/email'];
			$_SESSION['start'] = time();
			$_SESSION['last_activity'] = time();
			$_SESSION['book'] = 'bev1';
			$_SESSION['copyright'] = "Copyright &copy 2011, Charles Palmer, Beverly
Faulkner-Jones and Su-jean Seo. All rights reserved";
			$_SESSION['auth'] = 'admin';
			header("location:session-index.php");
			return;
		}
	}


# Check for categorical logins
if(isset($databaseId) && isset($passwd))
	{
	$loginConn = new Mongo('mongodb://' . $loginConnName);
	$loginDBColl = $loginConn->selectDB($loginDBName)->selectCollection('databases');
	$loginDBDoc = $loginDBColl->findOne(array('_id' => new MongoId($databaseId)));
	if(!is_null($loginDBDoc))
		{
		if($passwd == $loginDBDoc['studentpasswd'] || $passwd == $loginDBDoc['adminpasswd'])
			{
			session_start();
			$_SESSION['host'] = $loginDBDoc['host'];
			$_SESSION['book'] = $loginDBDoc['dbname'];
			$_SESSION['copyright'] = $loginDBDoc['copyright'];
			$_SESSION['auth'] = ($passwd == $loginDBDoc['adminpasswd']) ? 'admin' : 'student';
			header("location:session-index.php");
			}
		}
	}
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

		<link rel="stylesheet" href="libs/jquery.mobile-1.0.1/jquery.mobile-1.0.1.min.css" />
		<script src="libs/jquery-1.7.1/jquery-1.7.1.min.js"></script>
		<script src="libs/jquery.mobile-1.0.1/jquery.mobile-1.0.1.min.js"></script>
	</head>
	<body>
		<!-- Index pages -->
		<div data-role="page">
			<!-- Header -->
			<div data-role="header" data-position='fixed' data-fullscreen='false'>
				<h1> Slide Atlas </h1>
			</div>

			<!-- Content -->
			<div data-role="content">
				<p> This website is supported on multiple devices including iPad, iPhone and the latest desktop browsers </p>

				<form action="index.php" data-ajax="false" method="post">
					<div data-role="fieldcontain">
						<fieldset data-role="controlgroup">
							<legend>Please choose your affiliation:</legend>
							<?php
							$loginConn = new Mongo('mongodb://' . $loginConnName);
							$loginDBColl = $loginConn->selectDB($loginDBName)->selectCollection('databases');

							foreach ($loginDBColl->find() as $loginDBDoc)
								{
								echo '<input type="radio" name="database" id="' , $loginDBDoc['_id'], '" value="' , $loginDBDoc['_id'] , '" /> ', "\n";
								echo '<label for="' , $loginDBDoc['_id'] , '">' , $loginDBDoc['label'] , '</label> ', "\n";
								}
							?>
						</fieldset>
<script>
$("input:radio").change(function(event){$("#password").focus();});
</script>
						<div data-role="fieldcontain">
							<label for="password">Password:</label>
							<input type="password" name="passwd" id="password" value="" />
						</div>
						<center>
							<div>
								<button type="submit"  data-inline='true' data-theme="a">Submit</button>
							</div>
						</center>
					</div>
				</form>

				<!-- login
					Or authenticate using :
				<form action="?login" method="post" data-ajax="false">
					<center>
					<button data-theme="a" data-inline="true" data-ajax="false">Google</button>
					</center>
				</form>
				-->

				<!-- login -->
					Or authenticate using :
					<center>
					<a data-role="button" data-theme="a" data-inline="true" data-ajax="false" href="facebook_module.php">Facebook</a>
					</center>
				<!-- login -->
				</form>

			</div><!-- /content -->
		</div><!-- /page -->
	</body>
</html>

