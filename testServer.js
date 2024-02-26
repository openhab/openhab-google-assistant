const express = require('express');

const app = express();
const openhabGA = require('./functions/index.js');

app.use(express.json());

app.use('/', (req, res) => {
  openhabGA.openhabGoogleAssistant(req, res);
});

const port = process.env.OH_SERVER_PORT || 3000;
app.listen(port, () => {
  console.log('Server is listening on port %s', port);
});
