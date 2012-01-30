 <?php 
  session_start();

	$app_id = "212057308863490";
	$app_secret = "c46dd118cc71d9007a9062f7f9fa6b9c";
  #$my_url = "http://140.247.106.97/facebook/protected.php";
	$my_url = "http://127.0.0.1:82/facebook_module.php";
  #$my_url = "https://slide-atlas.org/facebook/protected.php";

	if (!isset($_REQUEST['code']))
		{

    $_SESSION['state'] = md5(uniqid(rand(), TRUE)); //CSRF protection
    $dialog_url = "https://www.facebook.com/dialog/oauth?client_id=" 
       . $app_id . "&redirect_uri=" . urlencode($my_url) . "&state="
       . $_SESSION['state'] . "&scope=email,user_groups";

    echo("<script> top.location.href='" . $dialog_url . "'</script>");
		}
else
	{
		 $code = $_REQUEST['code'];

     $token_url = "https://graph.facebook.com/oauth/access_token?"
       . "client_id=" . $app_id . "&redirect_uri=" . urlencode($my_url)
       . "&client_secret=" . $app_secret . "&code=" . $code;

		$response = file_get_contents($token_url);

		$params = null;
		parse_str($response, $params);

		# Get the groups information in the paginated query 
		$graph_url = "https://graph.facebook.com/me/groups?access_token=" 
			 . $params['access_token'];

		$groups =  json_decode(file_get_contents($graph_url), true);

		# Get information about the user logged into facebook
		$user_url = "https://graph.facebook.com/me?access_token=" 
			 . $params['access_token'];
		$user = json_decode(file_get_contents($user_url), true);
		
		# create the corredponding structure
		$_SESSION['groups'] = $groups['data']; 
		$_SESSION['facebook'] = $user;
		$_SESSION['start'] = time(); 
		$_SESSION['last_activity'] = time(); 
		$_SESSION['book'] = 'bev1';
		$_SESSION['copyright'] = "Copyright &copy 2011, Charles Palmer, Beverly
Faulkner-Jones and Su-jean Seo. All rights reserved";
		$_SESSION['auth'] = 'student';

	  header("location:access-groups.php");
}
?>

