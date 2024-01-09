const express = require("express");
const bodyParser = require("body-parser");
const productosRouter = require("./api/recursos/productos/productos.routes");

const app = express();
app.use(bodyParser.json());
//Base de datos de productos

app.use("/productos", productosRouter);

//sevidor corriendo super basico
app.get("/", (req, res) => {
  res.send("Api de vendetuscorotos.com.");
});

app.listen(3000, () => {
  console.log("Escuchando el puerto 3000.");
});
