// Program requires filesystem, mysql, and async.
const fs = require("fs"), filename = process.argv[2];
const mysql = require("mysql");
const async = require("async");

let gameDataArray = [];
let gameDataParsed = [];
let connection;
let arrayIndex = 0;

// Main function to populate the database.
function populateChessGameDatabase() {
  // Ensure a file is being passed as an argument.
  if (process.argv.length < 4) {
    console.log(process.argv[2] + " is OK File");
  } else {
    console.error("Error: Not valid arguments.");
    process.exit(1);
  }
  // MySQL connection properties. Insert your own properties if you wish to run this.
  connection = mysql.createPool({
    connectionLimit: 500,
    host: 'local',
    user: 'COLEAR',
    password: 'xxx',
    database: 'chessgames',
  });
  this.readTextFile(filename);
}

// Reads the txt file passed in the arguments and populates an array. Each section of the array has one full game.
populateChessGameDatabase.prototype.readTextFile = function (filename){
  gameDataArray = fs.readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
  console.log(gameDataArray[0]);
  console.log(gameDataArray[2]);

  async.eachSeries(gameDataArray, this.writeGame, function () {
    console.log("Complete.");
    process.exit();
  });
}

// Writes the game data to the database.
populateChessGameDatabase.prototype.writeGame = function (gameTitle, callback){
  async.waterfall([
    function (callback) {
      // Creates the game's name to keep track of it in the database. This differs from game ID because you can store the name of who played the game.
      let randNum1 = Math.floor((Math.random() * 9999999999) + 1);
      gameTitle = "COLEAR" + randNum1;
      console.log(gameTitle);
      callback(null, gameTitle);
    },
    function (gameTitle, callback) {
      // First insert game base information into database to be able to track game moves. (See README.md for database design).
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
      // To insert game moves, we need a game ID to relate the moves to a single game. This gets the game ID that was just created.
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
      // Inserts the moves into the database, which is the primary goal of the application.
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

      // Commit insert of data into database.
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
