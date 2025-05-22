// app.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Chemin de la base de données
const dbPath = path.join(__dirname, 'db/database.sqlite');

// Vérifie si le fichier existe (optionnel, juste pour log)
const dbExists = fs.existsSync(dbPath);
if (!dbExists) {
  console.log("Base de données non trouvée. Création d'une nouvelle base.");
}

// Ouvre (ou crée) la base
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error("Erreur de connexion à SQLite :", err.message);
  }
  console.log("Connecté à la base de données SQLite.");
});

// Crée les tables si elles n'existent pas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL NOT NULL,
    transport REAL,
    redMeat REAL,
    fishMeat REAL,
    whiteMeat REAL,
    vegeMeat REAL,
    veganMeat REAL,
    electricity REAL,
    eau REAL,
    chauffage REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../front')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

// Routes
const carbonRoutes = require('./carbonRoutes');
app.use('/api/carbon', carbonRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
