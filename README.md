# chessgame-data-processor
Node js code to take chess game notation from a text file and put it into a mysql database asynchronously.

To start, play a chessgame anywhere and grab the notation from it. I recommend using Chess.com and analyzing the game after. Instructions below.
If you chose to use something else, make sure all the game data is on one line. See example below for notation.

Notation should be as follows:
"1. e4 e5 2. d4 d5 3." ... and so on for the whole game. Notice the spaces between the moves and move number.

Games can end on white's move. If this is the case, "XXX" will be inserted for black, indicating black resigned. If no "#" is given in the last move, then a player resigned.

FOR CHESS.COM NOTATION:
1. Play a game on chess.com. It can be any kind that you like.
2. After the game has concluded, navigate to the menu on the left side, go to Play > Archive
3. Select the game that you just played.
4. Below the notation menu on the right, there are 4 buttons. Click the left-most one "Analysis".
5. In the new window, copy the notation in the upper right of the menu. 
    NOTE: there will be a couple places that you see the notation. At the very top is notation for continuation of the game (if possible). 
    Copy what is BELOW this.
6. Paste this data into a text file. it should look something like this, but with different moves (NOTE: see example file if explanation is not clear)
    1. e4 e5 2. Nf3 Nc6 3. c3 Bc5 4. d4 exd4 5. cxd4 Bb4+ 6. Bd2 Bxd2+ 7. Nbxd2 Nge7 8. d5 Nb4 9. a3 Nbxd5 10. exd5 O-O 11. Bd3 Nxd5 12. O-O Nf4 13. Bb1 Re8 14. Qa4 Ne2+ 15. Kh1 Nc3 16. Qc2 Nxb1 17. Raxb1 d6 18. b4 b6 19. h4 Bb7 20. Ng5 g6 21. Ndf3 Bxf3 22. gxf3 h6 23. Nh3 Qxh4 24. Kh2 Qh5 25. Rb3 Qe5+ 26. Kh1 Re6 27. Qxc7 Qb5 28. Kg2 Rae8 29. Nf4 Qg5+
7. Run the program: "node chessprocess.js XXXXX.txt" without double quotes and insert the name of your txt file in the XXXXX.

FOR OTHER NOTATION:
  See step 6 above. Use the example to make sure all game notation is on one line and with spaces.
  
As of now, 1000 chess games take about 3 seconds to process and insert.

FUTURE IMPROVEMENTS:
  More error handling.
  Support multiple ways of notation instead of just on one line (Ex: multi-line notation for single games.)
