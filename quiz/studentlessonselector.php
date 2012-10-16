

<?php

$m = new Mongo();
$d = $m->selectDb("demo");
$c2 = $d->selectCollection("lessons");

$lessons = $c2->find();

?>

<html>

<head>
    <title>Question List</title>

    <style type="text/css" >
        body {
            background-color: #BCD2EE;
        }
        #container {
            width: 1220px;
            height: 700px;
            overflow-y: scroll;
            overflow-x: hidden;
            margin-left: auto;
            margin-right: auto;
            background-color:#0198e1;
        }
        .lessonindicator {
            width: 220px;
            height: 50px;
            margin: 10px;
            float: left;
            background-color: #00eeee;
            word-wrap:break-word;
        }
    </style>
</head>

<body>
    <div id="container" >
        <?php
        foreach($lessons as $l){
        ?>
            <a href="studentquestionselector.php?lid=<?php echo $l['_id'];?>" >
            <div class="lessonindicator" >
                <?php
                    if(isset($l['name'])){
                        echo $l['name'];
                    } else {
                        echo $l['_id'];
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