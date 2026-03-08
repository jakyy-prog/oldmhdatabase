const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());

const db = new sqlite3.Database("./database/quest/mhp3rd/guild_p3.db");

app.get("/quest/:game/:type/:stars", (req, res) => {
  const { game, type, stars } = req.params;

  if (type !== "village" && type !== "guild") {
    res.status(400).json({ error: "Type harus 'village' atau 'guild'" });
    return;
  }

  const table = type;

  db.all(`SELECT * FROM ${table} WHERE stars = ?`, [stars], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});
