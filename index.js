const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuid } = require("uuid");
const _ = require("underscore");

const app = express();
app.use(bodyParser.json());
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
  //crear
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

app
  .route("/productos/:id")
  //buscar
  .get((req, res) => {
    for (let producto of productos) {
      if (producto.id == req.params.id) {
        res.json(producto);
        return;
      }
    }
    //Not Found-Producto no encontrado
    res.status(404).send("El producto con id " + req.params.id + " no existe.");
  })
  //actualizar
  .put((req, res) => {
    let id = req.params.id;
    let remplazoParaProducto = req.body;
    if (
      !remplazoParaProducto.nombre ||
      !remplazoParaProducto.precio ||
      !remplazoParaProducto.moneda
    ) {
      //Bad request-No cumple tus requisitos
      res.status(400).send("El producto debe tener nombre y precio.");
      return;
    }
    let indice = _.findIndex(productos, (producto) => producto.id == id);
    if (indice != -1) {
      remplazoParaProducto.id = id;
      productos[indice] = remplazoParaProducto;
      res.status(200).json(remplazoParaProducto);
    } else {
      res
        .status(404)
        .send("El producto con id " + req.params.id + " no existe.");
    }
  })
  //borrar
  .delete((req, res) => {
    let indiceBorrar = _.findIndex(
      productos,
      (producto) => producto.id == req.params.id
    );
    if (indiceBorrar === -1) {
      res
        .status(404)
        .send("El producto con id " + req.params.id + " no existe.");
    }
    let borrado = productos.splice(indiceBorrar, 1);
    res.status(200).json(borrado);
  });

//sevidor corriendo super basico
app.get("/", (req, res) => {
  res.send("Api de vendetuscorotos.com.");
});

app.listen(3000, () => {
  console.log("Escuchando el puerto 3000.");
});
