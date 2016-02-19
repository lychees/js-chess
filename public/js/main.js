var SE_select;
var SE_move;
var SE_eat;

var board, game;
var socket = io();
var user_id, room_id;
var nickname = "xiaodao";

$('#nickname').on('change', function(){
    //alert($(this).val());
    socket.emit('change nickname', $(this).val());    
    $('#room_name').attr('value', $(this).val()+'的房间');
});

function join_room(){
    alert("Join!");
}

function refresh_rooms(rooms){
    socket.emit('refresh rooms');   
}


// --------------------------------------

var removeGreySquares = function() {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
  var squareEl = $('#board .square-' + square);
  
  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

var onDragStart = function(source, piece) {
  // do not pick up pieces if the game is over
  // or if it's not that side's turn
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
  SE_select.play();
};

var onDrop = function(source, target) {
    
  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';
  socket.emit('move', source, target); 
  SE_move.play();
};


var onMouseoverSquare = function(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

var onMouseoutSquare = function(square, piece) {
  removeGreySquares();
};

var onSnapEnd = function() {
  board.position(game.fen());
};

socket.on('login', function(t){
    //console.log(t);
    board.position(t);
});


socket.on('move', function(source, target){    
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });
    board.move(source+"-"+target);
    SE_move.play();
});

socket.on('new game', function(){
    game.reset();
    board.position('start', true);
});


$(document).ready(function(){          
    board = ChessBoard('board', {
        position: 'start',
        draggable: true,
        //dropOffBoard: 'trash',
        //sparePieces: true,
        moveSpeed: 'slow',
        snapbackSpeed: 500,
        snapSpeed: 100,
        
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    });

    game = new Chess();

    $('#startBtn').on('click', function(){
        //board.start;
        game.reset();
        board.position('start', true);         
        socket.emit('new game');             
    });

    //$('#clearBtn').on('click', board.clear);  
    socket.emit('login');    

    SE_select = document.createElement('audio');
    SE_select.setAttribute('src', './Audio/SE/select.ogg');
    SE_move = document.createElement('audio');
    SE_move.setAttribute('src', './Audio/SE/move.ogg');    
    SE_eat = document.createElement('audio');
    SE_eat.setAttribute('src', './Audio/SE/eat.ogg');
});


