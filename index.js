const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const chapterRouter = require('./routes/chapterRouter');
const mangaRouter = require('./routes/mangaRouter');
const response = require('./response');

dotenv.config();

app.use(express.json());
app.use(cors());

// router
app.use('/api', mangaRouter);
app.use('/api/chapter', chapterRouter);

app.get('/', (req, res) => {
  response(res, 200, true, '🚀 Server is live!');
});

app.get('/*', (req, res) => {
  response(res, 404, false, '⛔ Not found!');
});

app.listen(process.env.PORT, () => {
  console.log('🚀 Backend server is running!');
  console.log(`🚀 Running port *:${process.env.PORT}`);
});

module.exports = app;
