<!DOCTYPE html>

<html>

	<head>
		<title>Lesson Maker</title>
		
		<link rel="stylesheet" type="text/css" href="lessonmaker.css" />
        
        <link type="text/css" href="js/css/ui-lightness/jquery-ui-1.8.22.custom.css" rel="stylesheet" />
		<script type="text/javascript" src="js/js/jquery-1.7.2.min.js"></script>
		<script type="text/javascript" src="js/js/jquery-ui-1.8.22.custom.min.js"></script>
        <style>
            #sortable {list-style-type: none; margin: 10; padding:0}
        </style>
        <script type="text/javascript">
        
        var newfunction = function(id) {
            
            //='501bc5210642741838000000';
            alert(" button clicked");
            //$.remove('#501bc5210642741838000000');
            $('li#'+id).remove();
            //saveLesson();
        }
        
        $(document).ready(function() {
            
            var qid = '501bc5210642741838000000';
            
            //var liststring = '<li class="ui-state-default" id="'+qid+'">'+
            //            '<button type="button" class="del" onclick="newfunction('+qid+');" >X</button>Slide</li>';
            //var liststring = '<li class="ui-state-default" id="501bc5210642741838000000">'+
            //            '<button type="button" class="del" id="501bc5210642741838000000" onclick="newfunction();" >X</button>Slide</li>';
            //        $('ul').append(liststring);
            var liststring = '<li class="ui-state-default" id="'+qid+'">'+
                        '<button type="button" class="del" onclick="newfunction(\''+qid+'\');" >X</button>Slide</li>';
                    $('ul').append(liststring);
            
            
        });
        </script>
	</head>
	
	<body>
		<div class="container">
            <div class="qlist" >
            <!--<button onclick="saveLesson();" style="width:100%;" >Save</button>-->
                <ul id="sortable">
                    <li>Element</li>
                </ul>
                
            </div>
			<button type="button" class="del" onclick="newfunction();">DELETE</button>
		</div>
	</body>

</html>