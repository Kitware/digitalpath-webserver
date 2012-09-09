

var LESSONID;

function init(lessonId){
    LESSONID = lessonId;
    
    $.ajax({url:"getquestions.php?lid="+LESSONID, success:function(qidList){
        var obj = jQuery.parseJSON(qidList);
        for (var i = 0; i < obj.length; ++i) {
            var qid2 = obj[i].qid.$id;
            var imageId = obj[i].imageid;
            if(obj[i].title){
                var liststring =
                    '<li class="ui-state-default" id="'+qid2+'" style="border:1px solid black;">'+
                        '<a href="viewer.php?id='+qid2+'" >'+
                            '<img src="tile.php?db=demo&image='+imageId+'&name=t.jpg" />'+
                        '</a>'+
                        '<button id="del'+qid2+'" type="button" class="del" >X</button>'+
                        obj[i].title+
                    '</li>';
            } else {
                var liststring =
                    '<li class="ui-state-default" id="'+qid2+'" style="border:1px solid black;">'+
                        '<a href="viewer.php?id='+qid2+'" >'+
                            '<img src="tile.php?db=demo&image='+imageId+'&name=t.jpg" />'+
                        '</a>'+
                        '<button id="del'+qid2+'" type="button" class="del" >X</button>'+
                        qid2.substring(0, 10)+
                    '</li>';
            }
            $('#sortable').append(liststring);
            $('#del'+qid2).click(function(){
                var qid3 = $(this).parent().attr('id');
                $(this).parent().remove();
                deleteQuestion(qid3);
            });
        }
    }});
}

function saveLesson () {
    var result = $('#sortable').sortable('toArray');
    $.post("assignindex.php", {qlist:result, lid:LESSONID});
    window.location.reload(true);
}

function deleteQuestion(id) {
    $.ajax({url:"removequestion.php?id="+id+"&lid="+LESSONID, success:function(){
        saveLesson();
        window.location.reload(true);
    }});
}

function addquestion(imageid){
    //qid is a new, unique question id
    $.ajax({url:"addquestion.php?image="+imageid+"&lid="+LESSONID, success:function(qid){
        var qid2 = jQuery.parseJSON(qid).$id;
        var liststring =
            '<li class="ui-state-default" id="'+qid2+'" style="border:1px solid black;">'+
                '<a href="viewer.php?id='+qid2+'" >'+
                    '<img src="tile.php?db=demo&image='+imageid+'&name=t.jpg" />'+
                '</a>'+
                '<button id = "del'+qid2+'" type="button" class="del" >X</button>'+
                qid2.substring(0, 10)+
            '</li>';
        $('#sortable').append(liststring);
        $('#del'+qid2).click(function(){
            deleteQuestion(qid2);
        });
        saveLesson();
    }});
}

$(document).ready(function() {

    $("#sortable").sortable();
    $("#sortable").disableSelection();
    
    $('#sortable').sortable({
    //start: function(event, ui) {
    //    saveLesson();
    //}
        update: function(event, ui) {
            saveLesson();
        }
    });

    
    /*$(".qelement").click(function() {
    function addquestion(imageid){
        var newindex = $('li').last().index()+1;
        //qid is a new, unique question id
        $.ajax({url:"addquestion.php?image="+imageid+"&index="+newindex, success:function(qid){
            var qid2 = jQuery.parseJSON(qid).$id;
            var liststring =
                '<li class="ui-state-default" id="'+qid2+'">'+
                    '<a href="viewer.php?id='+qid2+'" >'+
                        '<img src="tile.php?db=demo&image='+imageid+'&name=t.jpg" />'+
                    '</a>'+
                    '<button id = "del'+qid2+'" type="button" class="del" >X</button>'+
                    'Slide'+
                '</li>';
            $('#sortable').append(liststring);
            $('#del'+qid2).click(function(){
                deleteQuestion(qid2);
            });
            saveLesson();
        }});
    }*/
    
    // Populate the lesson questions.
    /*$.ajax({url:"getquestions.php?lid="+LESSONID, success:function(qidList){
        var obj = jQuery.parseJSON(qidList);
        for (var i = 0; i < obj.length; ++i) {
            var qid2 = obj[i].qid.$id;
            var imageId = obj[i].imageid;
            var liststring =
                '<li class="ui-state-default" id="'+qid2+'">'+
                    '<a href="viewer.php?id='+qid2+'" >'+
                        '<img src="tile.php?db=demo&image='+imageId+'&name=t.jpg" />'+
                    '</a>'+
                    '<button id="del'+qid2+'" type="button" class="del" >X</button>'+
                    'Slide'+
                '</li>';
            $('#sortable').append(liststring);
            $('#del'+qid2).click(function(){
                deleteQuestion(qid2);
            });
        }
    }});*/
    
});
