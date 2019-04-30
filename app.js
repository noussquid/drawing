
// Express requires these dependencies
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.engine('html', require('ejs').renderFile);

// Configure our application
app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
  app.set('view engine', 'html'); 
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  console.log(path.join(__dirname, 'public'));
  app.use(express.directory(__dirname, 'images'));
  app.use(express.static(__dirname, 'images'));
});

// Configure error handling
app.configure('development', function(){
  app.use(express.errorHandler());
});

// Setup Routes
app.get('/', routes.index);
app.get('/users', user.list);

// Enable Socket.io
var server = http.createServer(app).listen( app.get('port'));
var io = require('socket.io').listen( server );

var fs = require('fs');
var swans = fs.readdirSync(path.join(__dirname, 'public/images/'));
console.log(swans);

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {

  console.log(" we have a new client: " + socket.id);

  // A User starts a path
  socket.on( 'startPath', function( data, sessionId ) {

    socket.broadcast.emit( 'startPath', data, sessionId );

  });

  // A User continues a path
  socket.on( 'continuePath', function( data, sessionId ) {

    socket.broadcast.emit( 'continuePath', data, sessionId );

  });

  // A user ends a path
  socket.on( 'endPath', function( data, sessionId ) {

    socket.broadcast.emit( 'endPath', data, sessionId );

  });
  
  socket.on('mouse', function (data, sessionId ) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y, " session id " , sessionId);      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data, sessionId);
  });

  socket.on('swan', function(data, sessionId) {
    console.log("Received: 'swan' " + data);
    socket.broadcast.emit('swan', data);
  });

  socket.on('text', function(data, sessionId) {
    console.log("Received: 'swan' " + data);
    socket.broadcast.emit('text', data);
  });
});
