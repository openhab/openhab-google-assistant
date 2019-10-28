const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const openhabGA = require('./functions/index.js');

app.use(bodyParser.json());

app.use('/', (req, res) => {
  openhabGA.openhabGoogleAssistant(req, res);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
