const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

exports.saveUserIfNotExists = (name, callback) => {
  db.get('SELECT id FROM users WHERE name = ?', [name], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id);
    db.run('INSERT INTO users (name) VALUES (?)', [name], function (err) {
      callback(err, this?.lastID);
    });
  });
};

exports.saveResult = (result, callback) => {
  const {
    user_id, total, transport, redMeat, fishMeat, whiteMeat,
    vegeMeat, veganMeat, alimentation, electricity, eau, chauffage
  } = result;
  db.run(
    `INSERT INTO results (user_id, total, transport, redMeat, fishMeat, whiteMeat, vegeMeat, veganMeat, alimentation, electricity, eau, chauffage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, total, transport, redMeat, fishMeat, whiteMeat, vegeMeat, veganMeat, alimentation, electricity, eau, chauffage],
    function (err) {
      callback(err, this?.lastID);
    }
  );
};