// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../carbon-analyzer-frontend')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../carbon-analyzer-frontend/index.html'));
});

// Routes
const carbonRoutes = require('./routes/carbonRoutes');
app.use('/api/carbon', carbonRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
