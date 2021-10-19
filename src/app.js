const express = require('express');
const app = express();

app.all('*', (req, res) => res.send('Tool demo!'));
app.listen(80, () => console.log('Server ready...'));