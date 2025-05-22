// controllers/carbonController.js
const calculate = require('./carbonCalculator');
const { saveResult, saveUserIfNotExists } = require('./models/resultModel');

exports.calculateCarbon = (req, res) => {
  const userData = req.body;
  const username = userData.username;
  if (!username) {
    return res.status(400).json({ error: 'Nom requis' });
  }
  try {
    const result = calculate(userData);
    saveUserIfNotExists(username, (err, user_id) => {
      if (err) {
        console.error('Erreur utilisateur :', err);
        return res.status(500).json({ error: 'Erreur utilisateur' });
      }
      saveResult({ user_id, ...result, ...result.details }, (err, id) => {
        if (err) {
          console.error('Erreur lors de la sauvegarde du résultat :', err);
          return res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
        }
        res.json({ ...result, id });
      });
    });
  } catch (err) {
    res.status(400).json({ error: 'Erreur dans le calcul' });
  }
};
