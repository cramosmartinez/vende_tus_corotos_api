const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.get('/', (req, res) => {
    res.send('Api de vendetuscorotos.com.');
});

app.listen(3000, () => {
    console.log('Escuchando el puerto 3000.');
});