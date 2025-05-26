// controllers/carbonController.js
const calculate = require('./carbonCalculator');
const { saveResult, saveUserIfNotExists } = require('./models/resultModel');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, './db/database.sqlite');
const db = new sqlite3.Database(dbPath);

exports.calculateCarbon = (req, res) => {
  const userData = req.body;
  const username = userData.username;
  if (!username) {
    return res.status(400).json({ error: 'Nom requis' });
  }
  try {
    const result = calculate(userData);
    // Ajoute la somme alimentation
    const alimentation =
      (result.details.redMeat || 0) +
      (result.details.fishMeat || 0) +
      (result.details.whiteMeat || 0) +
      (result.details.vegeMeat || 0) +
      (result.details.veganMeat || 0);
    saveUserIfNotExists(username, (err, user_id) => {
      if (err) {
        console.error('Erreur utilisateur :', err);
        return res.status(500).json({ error: 'Erreur utilisateur' });
      }
      saveResult({ user_id, ...result, ...result.details, alimentation }, (err, id) => {
        if (err) {
          console.error('Erreur lors de la sauvegarde du résultat :', err);
          return res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
        }
        // Calcul du rang : nombre de personnes ayant un score inférieur (meilleur) + 1
        db.get(
          `SELECT COUNT(*) AS better FROM results WHERE total < ?`,
          [result.total],
          (err, row) => {
            if (err) {
              return res.status(500).json({ error: 'Erreur lors du calcul du rang' });
            }
            db.get(
              `SELECT COUNT(*) AS total FROM results`,
              [],
              (err2, row2) => {
                if (err2) {
                  return res.status(500).json({ error: 'Erreur lors du calcul du total' });
                }
                const rank = row.better + 1;
                const totalUsers = row2.total;
                res.json({ ...result, id, user_id, rank, totalUsers });
              }
            );
          }
        );
      });
    });
  } catch (err) {
    res.status(400).json({ error: 'Erreur dans le calcul' });
  }
};

// Nouvelle route pour comparer les résultats
exports.getAllResults = (req, res) => {
  db.all(
    `SELECT r.*, u.name FROM results r
     JOIN users u ON r.user_id = u.id
     ORDER BY r.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des résultats' });
      }
      res.json(rows);
    }
  );
};

// Classement par catégorie
exports.getCategoryRanks = (req, res) => {
  const { user_id, result_id } = req.query;
  if (!user_id || !result_id) {
    return res.status(400).json({ error: 'user_id et result_id requis' });
  }
  db.get('SELECT * FROM results WHERE id = ?', [result_id], (err, userResult) => {
    if (err || !userResult) return res.status(404).json({ error: 'Résultat non trouvé' });

    // Utilise la colonne alimentation stockée
    const categories = [
      'transport', 'alimentation', 'electricity', 'eau', 'chauffage'
    ];
    const ranks = {};
    let done = 0;

    categories.forEach(cat => {
      db.get(
        `SELECT COUNT(*) AS better FROM results WHERE ${cat} < ?`,
        [userResult[cat]],
        (err2, row) => {
          db.get(
            `SELECT COUNT(*) AS total FROM results WHERE ${cat} IS NOT NULL`,
            [],
            (err3, row2) => {
              ranks[cat] = {
                rank: (row?.better || 0) + 1,
                total: row2?.total || 1
              };
              done++;
              if (done === categories.length) res.json(ranks);
            }
          );
        }
      );
    });
  });
};
