// Program requires filesystem, readline, mysql, and async.
const fs = require("fs"), filename = process.argv[2];
const mysql = require("mysql");
const async = require("async");

let gameDataArray = [];
let gameDataParsed = [];
let connection;
let arrayIndex = 0;

function populateChessGameDatabase() {
  // Ensure a file is being passed as an argument.
  if (process.argv.length < 4) {
    console.log(process.argv[2] + " is OK File");
  } else {
    console.error("Error: Not valid arguments.");
    process.exit(1);
  }
  // MySQL connection properties.
  connection = mysql.createPool({
    connectionLimit: 500,
    host: 'DESKTOP-A54L0HN',
    user: 'COLEAR',
    password: 'chessgame123',
    database: 'chessgames',
  });
  this.readTextFile(filename);
}

populateChessGameDatabase.prototype.readTextFile = function (filename){
  gameDataArray = fs.readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
  console.log(gameDataArray[0]);
  console.log(gameDataArray[2]);

  async.eachSeries(gameDataArray, this.writeGame, function () {
    console.log("Complete.");
    process.exit();
  });
}

populateChessGameDatabase.prototype.writeGame = function (gameTitle, callback){
  async.waterfall([
    function (callback) {
      let randNum1 = Math.floor((Math.random() * 9999999999) + 1);
      gameTitle = "COLEAR" + randNum1;
      console.log(gameTitle);
      callback(null, gameTitle);
    },
    function (gameTitle, callback) {
      let sqlInsertToGameInfo = "INSERT INTO game_information (??, ??, ??) VALUES (?, NOW(), ?)"
      let sqlInserts = ["game_title", "date_played", "location_played", gameTitle, "Chess.com"];
      sqlInsertToGameInfo = mysql.format(sqlInsertToGameInfo, sqlInserts);

      console.log(sqlInsertToGameInfo);
      connection.getConnection( function (err, connection) {
        if (err) {
          console.error("SQL Error");
          process.exit(1);
          return;
        } else {
            connection.query(sqlInsertToGameInfo, function (err) {
              connection.release();
                if (err) throw err;
                else {
                  console.log("Success. Selecting game_id now...");
                  callback(null, gameTitle);
                }
            });
        }
      });
    },
    function (gameTitle, callback) {
      let sqlGetGameId = "SELECT game_id FROM chessgames.game_information WHERE game_title = '"+ gameTitle +"';";
      console.log(sqlGetGameId);
      connection.query(sqlGetGameId, function (err, result) {
        if (err){
          console.error("Error in selecting from database.");
          process.exit(1);
        } else {
          console.log(result);
          callback(null, gameTitle, result);
        }
      });
    },
    function (gameTitle, rows, callback) {
      let sqlInsertToGameRecord = "INSERT INTO chessgames.game_recorder (game_id, move_number, white_move, black_move) VALUES ?";
      let formattedArrayData = [];

      // Separate all moves for a single game.
      gameDataParsed = gameDataArray[arrayIndex].split(' ');

      // Take out periods from the move number. Database only takes smallint.
      for (x = 0; x < gameDataParsed.length; x++) {
        gameDataParsed[x] = gameDataParsed[x].replace('.', '');
        gameDataParsed[x] = gameDataParsed[x].replace('\r', '');
      }

      for (y = 0; y < gameDataParsed.length; y = y + 3) {
        //Games can end on white's move. Inserts value for black if that is the case.
        if (gameDataParsed[y + 2] != undefined){
          formattedArrayData.push([rows[0].game_id, gameDataParsed[y], gameDataParsed[y + 1], gameDataParsed[y + 2]]);
        } else {
          formattedArrayData.push([rows[0].game_id, gameDataParsed[y], gameDataParsed[y + 1], 'XXX']);
        }
      }

      connection.query(sqlInsertToGameRecord, [formattedArrayData], function (err, result) {
        if (err) throw err;
        console.log("Rows affected for "+ rows[0].game_id +": " + result.affectedRows);
        arrayIndex++;
        callback();
      });
    }
  ], function(err){
    if (err) throw err;
    callback();
  });
}
new populateChessGameDatabase();
