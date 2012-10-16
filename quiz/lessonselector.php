

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
  
  <link type="text/css" href="js/css/ui-lightness/jquery-ui-1.8.22.custom.css" rel="stylesheet" />
  <script type="text/javascript" src="js/js/jquery-1.7.2.min.js"></script>
  <script type="text/javascript" src="js/js/jquery-ui-1.8.22.custom.min.js"></script>
  
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
              '<div class="lessonindicator ui-widget-content" id="'+lessonid2+'" >'+
                '<a href="lessonmaker.php?lid='+lessonid2+'" >'+
                  '<div style="width:100%;margin-left:5px;">'+lname+'</div>'+
                '</a>'+
                '<button id="del'+lessonid2+'" >Delete</button>'+
                '<button id="set'+lessonid2+'" >Set Name</button>'+
              '</div>';
          } else {
            var liststring =
              '<div class="lessonindicator ui-widget-content" id="'+lessonid2+'" >'+
                '<a href="lessonmaker.php?lid='+lessonid2+'" >'+
                  '<div style="width:100%;margin-left:5px;" >ID:'+lessonid2+'</div>'+
                '</a>'+
                '<button id="del'+lessonid2+'" >Delete</button>'+
                '<button id="set'+lessonid2+'" >Set Name</button>'+
              '</div>';
          }
          $('.container').append(liststring);
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
    .container {
      width: 1080px;
      height: 700px;
      overflow-y: scroll;
      overflow-x: hidden;
      margin-left: auto;
      margin-right: auto;
      <!--background-color:#0198e1;-->
    }
    .lessonindicator {
      width: 250px;
      height: 60px;
      margin: 10px;
      float: left;
      background-color: #00eeee;
      word-wrap:break-word;
      border:1px solid black;
      overflow-x: hidden;
    }
    button {
      float:left;
    }
  </style>
</head>

<body>
  <div class="ui-widget" >
    <div class="container ui-widget-content" >
      <button type="button" style="width:100%;" onclick="addLesson();" >Add Lesson</button>
    </div>
  </div>
</body>

</html>