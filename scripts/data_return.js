$(document).ready(function(document){

$.ajax({
   url: 'data.php',
   type: "POST",
   data: {},
   success: function (response) {
        alert("THINGS");
   }
});

