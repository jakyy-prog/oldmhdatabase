const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());

const databases = {
  mhp3rd: new sqlite3.Database("./database/quest/mhp3rd/mhp3rd.db"),
  mhfu: new sqlite3.Database("./database/quest/mhfu/mhfu.db"),
};

app.get("/quest/:game/:type/:stars", (req, res) => {
  const { game, type, stars } = req.params;

  const db = databases[game];
  if (!db) {
    res.status(404).json({ error: "Game tidak ditemukan" });
    return;
  }

  if (type !== "village" && type !== "guild") {
    res.status(400).json({ error: "Type harus 'village' atau 'guild'" });
    return;
  }

  db.all(`SELECT * FROM ${type} WHERE stars = ?`, [stars], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get("/quest/:game/:type/stars/:stars", (req, res) => {
  const { game, type, stars } = req.params;

  const db = databases[game];
  if (!db) return res.status(404).json({ error: "Game tidak ditemukan" });
  if (type !== "village" && type !== "guild")
    return res.status(400).json({ error: "Type tidak valid" });

  db.all(`SELECT * FROM ${type} WHERE stars = ?`, [stars], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/quest/:game/:type/ranks/:rank", (req, res) => {
  const { game, type, rank } = req.params;

  const db = databases[game];
  if (!db) return res.status(404).json({ error: "Game tidak ditemukan" });
  if (type !== "village" && type !== "guild")
    return res.status(400).json({ error: "Type tidak valid" });

  db.all(
    `SELECT * FROM ${type} WHERE ranks = ? AND (type = 'Key Quest' OR type = 'Urgent Quest')`,
    [rank],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    },
  );
});

app.get("/files", (req, res) => {
  const fs = require("fs");
  const path = require("path");

  function listFiles(dir) {
    const result = {};
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        result[item] = listFiles(full);
      } else {
        result[item] = "file";
      }
    });
    return result;
  }

  res.json(listFiles(path.join(__dirname, "database")));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
