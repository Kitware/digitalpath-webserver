

<?php

$m = new Mongo();
$d = $m->selectDb('demo');
$c1 = $d->selectCollection('lessons');

/*
Remember, the lesson IDs are MongoIds, but only the STRING versions
will be passed to other webpages, including lessonmaker.php.
*/

?>

<html>

<head>
    <title>Lesson Selector</title>
    
    <script type="text/javascript" src="js/js/jquery-1.7.2.min.js"></script>
    
    <script type="text/javascript" >
        
        
        function addLesson(){
            $.ajax({url:"addlesson.php", success:function(lessonid){
                /*var lid = jQuery.parseJSON(lessonid);
                var lessonid2 = lid.$id;
                var liststring =
                    '<div class="lessonindicator" id="'+lessonid2+'" >'+
                        '<a href="lessonmaker?lid='+lessonid2+'" >'+
                        'ID:'+lessonid2+
                        '</a>'+
                        '<button id="del'+lessonid2+'" >Delete</button>'+
                        '<button id="set'+lessonid2+'" >Set Name</button>'+
                    '</div>';
                $('#container').append(liststring);
                $('#del'+lessonid2).click(function(){
                    var me = $(this);
                    var parent = me.parent();
                    var id = parent.attr('id');
                    parent.remove();
                    deleteLesson(id);
                });*/
                window.location.reload();
            }});
        }
        
        function deleteLesson(lessonid){
            $.ajax({url:"deletelesson.php?lid="+lessonid});
        }
        
        $(document).ready(function(){
            $.ajax({url:"getlessons.php", success:function(lessonList){
                var obj = jQuery.parseJSON(lessonList);
                for (var i = 0; i < obj.length; ++i) {
                    var lessonid2 = obj[i]._id.$id;
                    var lname = obj[i].name;
                    if(lname){
                        var liststring =
                            '<div class="lessonindicator" id="'+lessonid2+'" >'+
                                '<a href="lessonmaker.php?lid='+lessonid2+'" >'+
                                '<div style="width:100%;">'+lname+'</div>'+
                                '</a>'+
                                '<button id="del'+lessonid2+'" >Delete</button>'+
                                '<button id="set'+lessonid2+'" >Set Name</button>'+
                            '</div>';
                    } else {
                        var liststring =
                            '<div class="lessonindicator" id="'+lessonid2+'" >'+
                                '<a href="lessonmaker.php?lid='+lessonid2+'" >'+
                                '<div style="width:100%;" >ID:'+lessonid2+'</div>'+
                                '</a>'+
                                '<button id="del'+lessonid2+'" >Delete</button>'+
                                '<button id="set'+lessonid2+'" >Set Name</button>'+
                            '</div>';
                    }
                    $('#container').append(liststring);
                    $('#del'+lessonid2).click(function(){
                        var me = $(this);
                        var parent = me.parent();
                        var id = parent.attr('id');
                        parent.remove();
                        deleteLesson(id);
                    });
                    $("#set"+lessonid2).click(function(){
                        var name = prompt("Name this lesson:");
                        var me = $(this);
                        var parent = me.parent();
                        var id = parent.attr('id');
                        $.ajax({url:"setlessonname.php?lid="+id+"&name="+name, success:function(){
                            window.location.reload();
                        }});
                    });
                    
                }
            }});
        });
        
    </script>
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
        button {
            float:left;
        }
    </style>
</head>

<body>
    <div id="container" >
        <button type="button" style="width:100%;" onclick="addLesson();" >Add Lesson</button>
    </div>
</body>

</html>