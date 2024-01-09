const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuid } = require('uuid');

const app = express();
//Base de datos de productos
const productos = [
  { id: 1, nombre: "macbook pro 13", precio: 3000, moneda: "USD" },
  { id: 2, nombre: "taza de cafe", precio: 10, moneda: "USD" },
  { id: 3, nombre: "monitor", precio: 1000, moneda: "USD" },
];

app
  .route("/productos")
  .get((req, res) => {
    res.json(productos);
  })
  //localhost:3000/productos
  .post((req, res) => {
    let nuevoProducto = req.body;
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio ||
      !nuevoProducto.moneda
    ) {
      //Bad request-No cumple tus requisitos
      res.status(400).send("El producto debe tener nombre y precio.");
      return;
    }
    nuevoProducto.id = uuid();
    productos.push(nuevoProducto);
    //Creado
    res.status(201).json(nuevoProducto);
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
