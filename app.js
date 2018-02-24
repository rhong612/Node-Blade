var express = require('express');
var app = express();
var http = require('http').Server(app); //Creates a server and passes in app as the request handler

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

http.listen(3000, function() {
	console.log("Listening on port 3000...");
}); //Listen on port 3000

app.use('/client',express.static(__dirname + '/client'));