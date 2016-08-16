jQuery(function($){
  //make sure squares are square on page load
  var hi = $('.square').width();
  $('.square').height(hi+'px');
  //create sound effects
  var vicSnd = document.createElement('audio');
  vicSnd.src = 'snd/victory.mp3'; //sound found at http://mobilenest.xyz/wp-content/uploads/2016/02/victory_tone_ff7.mp3
  var defeatSnd = document.createElement('audio');
  defeatSnd.src = 'snd/defeat.mp3'; //sound found at hcloudfront.net
  var tieSnd = document.createElement('audio');
  tieSnd.src = 'snd/tie.mp3'; //sound found at cloudfront.net
  //track if the modal is shown
  var gameEnding = undefined;
  var modalHidden = true;
  $("#myModal").on('hidden.bs.modal', function(){
      modalHidden = true;
  });
  $("#myModal").on('shown.bs.modal', function () {
      modalHidden = false;
  });
    
  //assign selected symbol
  $('#myModal').modal('show');
  var urSgn = '';
  var opSgn = '';  
  $('.symbol-select').click(function(){
    urSgn = $(this).text();
    if (urSgn === 'x')
      opSgn = 'o';
    else
      opSgn = 'x';
    //computer makes the first move if you chose 'o's
    if (opSgn === 'x')
      opponentMove();
  });
  //enable sign selection with keyboard
  $(window).keypress(function(e){
    if (modalHidden)
      return;
      
    if(e.which === 43) {
      urSgn = 'x';
      opSgn = 'o';
      $('#myModal').modal('hide');
    }
    if (e.which === 45) {
      urSgn = 'o';
      opSgn = 'x';
      $('#myModal').modal('hide');
    }
    //computer makes the first move if you chose 'o's
    if (opSgn === 'x')
      opponentMove();
  });
  
  
  //initialize the board
  var brdArr = [];
  for (var ind = 0; ind < 9; ind++) {
    brdArr.push('');
  }
  
  //enable placing player's x's and o's by clicking
  $('.square').on('click', function(){
    //mark a square and make it unclickable
    $(this).text(urSgn);
    $(this).prop('disabled', true);
    //add marked square to array for defining the winner
    var index = Number($(this).attr('name'));
    brdArr[index] = urSgn;
    //let the computer move
    opponentMove();
  });
  
  //enable playing with numpad
  $(window).keypress(function(e){
    //return if welcome modal is shown
    if (!modalHidden) 
        return;    
    //return if the game is in transition from end to beginning 
    if (gameEnding !== undefined)
        return;
    
    var index = undefined;
    //numpad 1
    if(e.which === 49)
      index = 6;
    //numpad 2
    if(e.which === 50)
      index = 7;
    if(e.which === 51)
      index = 8;
    if(e.which === 52)
      index = 3;
    if(e.which === 53)
      index = 4;
    if(e.which === 54)
      index = 5;
    if(e.which === 55)
      index = 0;
    if(e.which === 56)
      index = 1;
    //numpad 9
    if(e.which === 57)
      index = 2;
    //if none of allowed 1-9 keys were pressed
    if (index === undefined)
        return;
    
    $('[name="' + index + '"]').text(urSgn);
    $('[name="' + index + '"]').prop('disabled', true);
    brdArr[index] = urSgn;
    opponentMove();
  });
  
  
  function opponentMove(){
    //stop playing if game ended
    if (whoWon (urSgn, opSgn, brdArr) !== undefined)
      return;
    //keep picking a random number until a free square if found
    do {
      var index = Math.floor(Math.random() * (9));
    } while ($('[name="' + index + '"]').prop('disabled') === true);
    //mark a square and add it to game board
    $('[name="' + index + '"]').text(opSgn);
    $('[name="' + index + '"]').prop('disabled', true);
    brdArr[index] = opSgn;
    
    whoWon (urSgn, opSgn, brdArr);
  }
  //check who won or it is a tie, takes player's symbol, opponent's symbol and game board as arguments
  function whoWon (you, teki, board) {
    var msg = '\n(the game will automatically reset in 3 seconds)';
    //give a chance to see the final step, then show results, block game from input, reset
    if (checkWinner(you) === you) {
      setTimeout(function(){declareResult(vicSnd, 'WINNER', '(^_^)', '#00e600');}, 1000);
      $('.square').prop('disabled', true);
      gameEnding = setTimeout(function(){reset();}, 5200);
      return 1;
    }
    else if (checkWinner(teki) === teki) {
      setTimeout(function(){declareResult(defeatSnd, 'DEFEAT', '(-_-;)', '#ff4d4d');}, 1000);
      $('.square').prop('disabled', true);
      gameEnding = setTimeout(function(){reset();}, 4000);
      return 0;
    }
    else {
      //check if board is already full, then it's a tie
      var fullArr = board.filter(function(value) {
        return value === ''; //check for empty spaces in array
      });
      if (fullArr.length === 0) {
        setTimeout(function(){declareResult(tieSnd, 'TIE', '(._.)', '#ffe066');}, 1000);
        $('.square').prop('disabled', true);
        gameEnding = setTimeout(function(){reset();}, 2500);
        return -1;
      }
    }
    return undefined;
  }
  //check if someone won, takes symbol (either player's or computer's) as an argument
  function checkWinner (sign) {
      //horizontal
      if (brdArr[0] === sign && brdArr[1] === sign && brdArr[2] === sign ||
      brdArr[3] === sign && brdArr[4] === sign && brdArr[5] === sign ||
      brdArr[6] === sign && brdArr[7] === sign && brdArr[8] === sign ||
      //vertical
      brdArr[0] === sign && brdArr[3] === sign && brdArr[6] === sign ||
      brdArr[1] === sign && brdArr[4] === sign && brdArr[7] === sign ||
      brdArr[2] === sign && brdArr[4] === sign && brdArr[6] === sign ||
      //diagonal
      brdArr[0] === sign && brdArr[4] === sign && brdArr[8] === sign ||
      brdArr[2] === sign && brdArr[5] === sign && brdArr[8] === sign) {
        //return winner's sign if he won
        return sign;
      }
      //if no one won yet
    return undefined;
  }
  //reset board to default state and let player choose symbol again
  function reset() {
    //choose symbol again
    $('#myModal').modal('show');
    //clear board
    for (var j = 0; j < 9; j++)
      brdArr[j] = '';
    $('.square').css('background-color', '#cccccc');
    $('.square').css('border', '1px solid yellow');
    $('.square').prop('disabled', false);
    $('.square').text('');
    //block user from messing with the game right after end and before start
    setTimeout(function(){gameEnding = undefined;}, 500);
  }
  //accepts sound object, verdict, smiley and color (strings) to display
  function declareResult(sound, verdict, smiley, color) {
    sound.play();
    $('.square').text('');
    for (var h = 0; h < verdict.length; h++)
        $('[name="' + h + '"]').text(verdict[h]);
    $('[name="7"]').text(smiley);
    $('.square').css('background-color', color);
    $('.square').css('border', 'none');
  }
});