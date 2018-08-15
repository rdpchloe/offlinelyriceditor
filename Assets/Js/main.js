var mainLyric = [];
var currentLineId = "";

$(document).ready(function(){
	$(".lyricTool").sticky({topSpacing:10});
	
	$(".btnLyricOutput").click(function(){
		$('#lyricOutputModal').modal('show');
		$('.taLyricResult').val(GenerateLyricOutput());
	})
	
	$(".btnSyncTime").click(function(){  	
		if (!InitialValidation())
			return false;
		
		$(".time").html(GetCurrentTime());
		SetLyricRowTime();
		JumpToNextLyricRow();
	});
	
	$(".btnTypeLyric").click(function(){
		$('#lyricModal').modal('show').on('shown.bs.modal', function () {
			$(".taLyric").focus();
		});
	});
	
	$(".btnInsertLyric").click(function(){
		
		var lyricText = $(".taLyric").val();
		LyricRawGenerator(lyricText);
		GenerateLyricTable();
		$('#lyricModal').modal('hide');
	});
	
    $("#inpMusic").change(function(obj){
    	$(".playerContainer").html('').html('<audio controls style="min-width: 100%;" id="audioPlayer"></audio>');
    	
    	var audio_player = document.getElementById("audioPlayer");
    	var obj2 = document.getElementById("inpMusic");
		var files = obj2.files ;
		var file = URL.createObjectURL(files[0]) ;
		audio_player.src = file;				
	});
});

function GenerateRandom() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 10; i++)
	text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function LyricRawGenerator(stringLyric)
{
	var arrLyric = stringLyric.split("\n");
	mainLyric = [];
	for (var i = 0; i < arrLyric.length; i++)
	{
		var partialLyric = {};
		var partialLyricText = arrLyric[i].trim();
		var id = GenerateRandom();
		partialLyric['id'] = id;
		partialLyric['text'] = partialLyricText;
		partialLyric['time'] = "";
		partialLyric['timeSecond'] = 0;
		partialLyric['skip'] = false;
		if (partialLyricText == "")
			partialLyric['skip'] = true;
			
		mainLyric.push(partialLyric);
	}
	
	if (mainLyric.length > 0)
	{
		currentLineId = mainLyric[0].id;
	}
}

function GenerateLyricTable()
{
	for (var i = 0; i < mainLyric.length; i++)
	{
		var strRow = '';
		strRow += '<tr class="lyricRow lyricRowData-' + mainLyric[i].id + '">'; 
		strRow += '<td class="lyricText lyricTextData-' + mainLyric[i].id + '" data-id="'+mainLyric[i].id+'">'+ mainLyric[i].text +'</td>'; 
		strRow += '<td class="timeData timeData-'+ mainLyric[i].id +'">'+ mainLyric[i].time +'</td>'; 
		strRow += '<td><a href="javascript:void(0)" class="text-danger btnDeleteRowLyric" data-id="'+ mainLyric[i].id +'"><i class="fa fa-trash"></i></a></td>'; 
		strRow += '</tr>'; 
		
		$(".lyricTable").append(strRow);
	}
	
	if (mainLyric.length > 0)
	{
		$(".lyricRowData-" + mainLyric[0].id).addClass("bg-warning");
		$(".btnDeleteRowLyric").click(function(){
			DeleteRowLyric($(this).attr("data-id"));
		});
		$(".lyricText").unbind().click(function(){
			SelectRowLyric($(this).attr("data-id"));
		});
	}
}

function DeleteRowLyric(lyricId)
{
	bootbox.confirm({
	    message: "Delete this row?",
	    buttons: {
	        confirm: {
	            label: 'Yes',
	            className: 'btn-success'
	        },
	        cancel: {
	            label: 'No',
	            className: 'btn-danger'
	        }
	    },
	    callback: function (result) {
	    	if (result)
	   			$(".lyricRowData-" + lyricId).remove();     	
	    }
	});
}

function SelectRowLyric(lyricId, autoPlayMusic = true)
{
	$(".lyricRow").removeClass("bg-warning");
	currentLineId = lyricId;
	$(".lyricRowData-" + lyricId).addClass("bg-warning");
	for (var i = 0; i < mainLyric.length; i++)
	{
		if (mainLyric[i].id == lyricId && mainLyric[i].time != '' && autoPlayMusic == true)
		{
			var vid = document.getElementById("audioPlayer");
			vid.currentTime = mainLyric[i].timeSecond;
		}
	}
}

function GetCurrentTime()
{
	var vid = document.getElementById("audioPlayer");
	var cTime = vid.currentTime;
	var t = new Date(1970, 0, 1); // Epoch
	t.setSeconds(cTime);
	var hour = (t.getHours()<10?'0':'') + t.getHours();
	var minute = (t.getMinutes()<10?'0':'') + t.getMinutes();
	var sec = (t.getSeconds()<10?'0':'') + t.getSeconds();
	var arrMili = cTime.toString().split(".");
	var mili = "00";
	if (cTime % 1 != 0)
	{
		mili = arrMili[1].substring(0,2);	
	}
	
	return minute + ":" + sec + "." + mili;
}

function GetCurrentTimeInSecond()
{
	var vid = document.getElementById("audioPlayer");
	var cTime = vid.currentTime;
	return cTime;			
}

function SetLyricRowTime()
{
	var lyricTime = GetCurrentTime();
	$(".timeData-" + currentLineId).text(lyricTime);
	for (var i = 0; i < mainLyric.length; i++)
	{
		if (mainLyric[i].id == currentLineId)
		{
			mainLyric[i].time = lyricTime;
			mainLyric[i].timeSecond = GetCurrentTimeInSecond();
		}
	}
}

function JumpToNextLyricRow()
{
	if (currentLineId == "")
		return false;
		
	var lastIndexLyric= mainLyric.length - 1;
	for (var i = 0; i < mainLyric.length; i++)
	{
		if (mainLyric[i].id == currentLineId && i != lastIndexLyric)
		{
			SelectRowLyric(mainLyric[i+1].id, false); 
			AutoScrollLyricRow("lyricRowData-" + mainLyric[i+1].id);
			return true;
		}
	}
}

function AutoScrollLyricRow(rowElemClass)
{
	var docViewTop = $(window).scrollTop();
    var docViewBottom = (docViewTop + $(window).height()) - 48;
    
    var elemTop = $('.' + rowElemClass).offset().top;
    var elemBottom = elemTop + $('.' + rowElemClass).height();
    
    if (elemBottom > docViewBottom)
    {
		$(window).scrollTop(docViewTop + $('.' + rowElemClass).height());
	}
}

function GetIndexMainLyricByCurrentid(lyricId)
{
	for (var i = 0; i < mainLyric.length; i++)
	{
		if (mainLyric[i].id == lyricId)
			return i;
	}
}

function InitialValidation()
{
	if ($('#inpMusic').get(0).files.length === 0)
	{
		alert("Please insert song");
		return false;	
	}
	
	if (mainLyric.length == 0)
	{
		alert("Please insert lyric.");
		return false;	
	}
	
	return true;
}

function GenerateLyricOutput()
{
	if (mainLyric.length == 0)
		return '< No result available >';
	
	var resultLyric = '';
	for (var i = 0; i < mainLyric.length; i++)
	{
		var timeResult = '';
		if (mainLyric[i].time != '')
			timeResult = '[' + mainLyric[i].time + ']';
		resultLyric += timeResult + mainLyric[i].text + '\n';
	}
	
	return resultLyric;
}