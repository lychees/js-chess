// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io');
var port = 2336;

io = io.listen(server);
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Info
var numUsers = 0;
var numUsers = 0;

var COLUMNS = 'abcdefgh'.split('');

function deepCopy(thing) {
  return JSON.parse(JSON.stringify(thing));
}

function fenToPieceCode(piece) {
  // black piece
  if (piece.toLowerCase() === piece) {
    return 'b' + piece.toUpperCase();
  }

  // white piece
  return 'w' + piece.toUpperCase();
}

function fenToObj(fen) {
  fen = fen.replace(/ .+$/, '');
  var rows = fen.split('/');
  var position = {};
  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    var row = rows[i].split('');
    var colIndex = 0;
    for (var j = 0; j < row.length; j++) {      
      if (row[j].search(/[1-8]/) !== -1) {
        var emptySquares = parseInt(row[j], 10);
        colIndex += emptySquares;
      }
      else {
        var square = COLUMNS[colIndex] + currentRow;
        position[square] = fenToPieceCode(row[j]);
        colIndex++;
      }
    }
    currentRow--;
  }
  return position;
}

var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', board = fenToObj(START_FEN);

function calculatePositionFromMoves(position, moves) {
  position = deepCopy(position);
  //console.log(moves);
  for (var i in moves) {
    var piece = position[i];
    delete position[i];
    position[moves[i]] = piece;
  }
  return position;
}


io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('login', function () {
        if (addedUser) return;
        ++numUsers; addedUser = true;        
        socket.emit('login', board);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function (){
        if (addedUser) {
            --numUsers;
        }
    });

    socket.on('move', function(source, target){    
        var moves = {}; moves[source] = target;
        board = calculatePositionFromMoves(board, moves);    
        //console.log(board);
        socket.broadcast.emit('move', source, target);        
    });

    socket.on('new game', function(){   
        board = fenToObj(START_FEN);
        socket.broadcast.emit('new game');        
    });
});
