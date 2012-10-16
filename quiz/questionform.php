

<?php

$label = $_GET['label'];
$numchoices = $_GET['numchoices'];

if(!$numchoices){
	$numchoices = 1;
}

$m = new Mongo();
$d = $m->selectDb("demo");
$c = $d->selectCollection("lesson");

$q = $c->findOne(array('imageid'=>new MongoId($label)));
//Find the image.  If there is a question associated with it, we can display it.



$choice = 0;

?>

<html>
	<head>
		<!--<script type="text/javascript">
			function OnSubmitForm()
			{
				if(document.pressed == 'Add answer choice')
				{
					//document.myform.action ="encodequestion.php?label=<?php //echo $label; ?>&add=1";
                    window.location = "encodequestion.php?label=<?php //echo $label; ?>&add=1";
				}
				else if(document.pressed == 'Submit question')
				{
					//document.myform.action ="encodequestion.php?label=<?php //echo $label; ?>&add=0";
                    window.location = "encodequestion.php?label=<?php //echo $label; ?>&add=0";
				}
				return true;
			}
		</script>-->
	</head>
	<body>
		<form method="post" action="encodequestion.php?label=<?php echo $label; ?>&add=1" >
			Question:<br />
			<textarea name="question" value="<?php echo $q['qtext'];?>" ></textarea><br /><br />
			<?php
			while($choice < $numchoices){
                //
				echo $choice+1;?>: <input type="text" name="answers[]" value="<?php if(isset($q['choices'])){echo $q['choices'][$choice];}?>" /><br />
                <?php $choice = $choice + 1;
            } ?>
			<input type="submit" value="Add answer choice" />
		</form>
		<br />
	</body>
</html>