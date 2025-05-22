// controllers/carbonController.js
const calculate = require('./carbonCalculator');

exports.calculateCarbon = (req, res) => {
  const userData = req.body;
  console.log('Received data:', userData);
  try {
    const result = calculate(userData);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Erreur dans le calcul' });
  }
};
