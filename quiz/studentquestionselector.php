

<?php

$lessonid = $_GET['lid'];

$m = new Mongo();
$d = $m->selectDb("demo");
$c1 = $d->selectCollection("images");
$c2 = $d->selectCollection("lessons");
$c3 = $d->selectCollection("questions");

$lesson = $c2->findOne(array("_id"=>new MongoId($lessonid)));

?>

<html>

<head>

    <title>Question List</title>

    <style type="text/css" >
        body {
            background-color: #BCD2EE;
        }
        #container {
            width: 970px;
            height: 700px;
            overflow-y: scroll;
            overflow-x: hidden;
            margin-left: auto;
            margin-right: auto;
            background-color:#0198e1;
        }
        .questionindicator {
            width: 300px;
            height: 100px;
            margin: 10px;
            float: left;
            background-color: #00eeee;
            word-wrap:break-word;
        }
        img {
            width:100px;
            height:100px;
            float:left;
        }
    </style>

</head>

<body>
    <div id="container" >
        <?php
        for($i = 0; $i < count($lesson['questions']); $i++){
            $question = $c3->findOne(array('qid'=>$lesson['questions'][$i]));
            $imageid = $question['imageid'];
        ?>
            <a href="studentviewer.php?id=<?php echo $lessonid;?>&index=<?php echo $i;?>" >
            <div class="questionindicator" >
                <img src="tile.php?db=demo&image=<?php echo $imageid;?>&name=t.jpg" alt="Image" />
                <?php
                    if(isset($question['title'])){
                        echo $question['title'];
                    } else {
                    ?>
                    Question #<?php echo $i+1;?>
                    <?php
                    }
                ?>
            </div>
            </a>
        <?php
        }
        ?>
    </div>
</body>

</html>
