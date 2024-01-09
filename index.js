const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const productos = [
  { id: 1, nombre: "macbook pro 13", precio: 3000, moneda: "USD" },
  { id: 2, nombre: "taza de cafe", precio: 10, moneda: "USD" },
  { id: 3, nombre: "monitor", precio: 1000, moneda: "USD" },
];

app.route("/productos").get((req, res) => {
  res.json(productos);
});

app.get("/productos/:id", (req, res) => {
  for (let producto of productos) {
    if (producto.id == req.params.id) {
      res.json(producto);
      return;
    }
  }
  //Not Found-Producto no encontrado
  res.status(404).send("El producto con id " + req.params.id + " no existe.");
});

//sevidor corriendo super basico
app.get("/", (req, res) => {
  res.send("Api de vendetuscorotos.com.");
});

app.listen(3000, () => {
  console.log("Escuchando el puerto 3000.");
});
