const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const installDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server has started at 3000"));
  } catch (e) {
    prevent.event(1);
    console.log(`dbError :${e.message}`);
  }
};
installDB();

convertIntoCamelCase = (eachArray) => {
  return {
    playerId: eachArray.player_id,
    playerName: eachArray.player_name,
  };
};

convertMatchIntoPascal = (viewMatchId) => {
  return {
    matchId: viewMatchId.match_id,
    match: viewMatchId.match,
    year: viewMatchId.year,
  };
};

//get players

app.get("/players/", async (request, response) => {
  const getPlayersDetails = `
    SELECT *
    FROM player_details;
    `;
  const viewPlayerDetails = await db.all(getPlayersDetails);
  response.send(
    viewPlayerDetails.map((eachArray) => convertIntoCamelCase(eachArray))
  );

  // get playerId

  app.get("/players/:playerId/", async (request, response) => {
    const { playerId } = request.params;
    const getOnePlayerId = `
      SELECT *
      FROM player_details
      WHERE player_id=${playerId};
      `;
    const viewPlayerId = await db.get(getOnePlayerId);
    response.send({
      playerId: viewPlayerId.player_id,
      playerName: viewPlayerId.player_name,
    });
  });

  // update player

  app.put("/players/:playerId/", async (request, response) => {
    const { playerId } = request.params;
    const { playerName } = request.body;

    const updatePlayer = `
      UPDATE player_details
      SET
      player_name='${playerName}'
      WHERE player_id=${playerId}
      `;
    const viewUpdatePlayer = await db.run(updatePlayer);
    response.send("Player Details Updated");
  });

  // get match Id
  app.get("/matches/:matchId/", async (request, response) => {
    const { matchId } = request.params;
    const getMatchId = `
      SELECT * 
      FROM match_details
      WHERE match_id=${matchId}`;
    const viewMatchId = await db.get(getMatchId);
    response.send(convertMatchIntoPascal(viewMatchId));
  });

  // /players/:playerId/matches/

  app.get("/players/:playerId/matches/", async (request, response) => {
    const { playerId } = request.params;
    const allMatches = `
      SELECT *
      FROM player_match_score
      NATURAL JOIN match_details
      WHERE player_id=${playerId}`;
    const viewAllMatches = await db.all(allMatches);
    response.send(viewAllMatches.map((each) => convertMatchIntoPascal(each)));
  });

  // match
  app.get("/matches/:matchId/players", async (request, response) => {
    const { matchId } = request.params;
    const allMatches = `
      SELECT *
      FROM player_match_score
      NATURAL JOIN player_details
      WHERE match_id=${matchId}`;
    const viewAllMatches = await db.all(allMatches);
    response.send(viewAllMatches.map((each) => convertIntoCamelCase(each)));
  });

  app.get("/players/:playerId/playerScores", async (request, response) => {
    const { playerId } = request.params;
    const getMatchAll = `
      SELECT 
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes

      FROM 
        player_match_score
      NATURAL JOIN player_details
      WHERE
       player_id=${playerId};`;
    const viewAllMatches = await db.get(getMatchAll);
    response.send(viewAllMatches);
  });
});

module.exports = app;
