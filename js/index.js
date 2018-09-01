// JavaScript Document
var j = jQuery.noConflict();
// fade in image thumbs
j(function() {
	j(".thumb").bind("load", function () {
		j(this).hide().fadeIn(2000, "swing");
	});
});  
// front page wink is a random page link
function randomPage()
{
	var pages = new Array("/art/3d.html", "/art/2d.html", "/music.html", "/contact.html");
	var rand = Math.floor(Math.random()*pages.length);
	window.location = pages[rand];
}
// waiting room message
function showMsg()
{
	var span = document.getElementById("hiddenMsg");
	span.style.visibility = "visible";
}
function hideMsg()
{
	var span = document.getElementById("hiddenMsg");
	span.style.visibility = "hidden";
}