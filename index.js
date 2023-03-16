const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

app.use(express.json());
app.use(cors());

// router

app.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: '🚀 Server is live!',
  });
});

app.get('/*', (req, res) => {
  res.status(404).json({ status: false, message: '⛔ Not found!' });
});

app.listen(process.env.PORT, () => {
  console.log('🚀 Backend server is running!');
  console.log(`🚀 Running port *:${process.env.PORT}`);
});
