const express = require("express");
const _ = require("underscore");
const productos = require("../../../database").productos;
const productosRouter = express.Router();
const { v4: uuid } = require("uuid");

productosRouter.get("/", (req, res) => {
  res.json(productos);
});
//localhost:3000/productos
//crear
productosRouter.post("/", (req, res) => {
  let nuevoProducto = req.body;
  if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.moneda) {
    //Bad request-No cumple tus requisitos
    res.status(400).send("El producto debe tener nombre y precio.");
    return;
  }
  nuevoProducto.id = uuid();
  productos.push(nuevoProducto);
  //Creado
  res.status(201).json(nuevoProducto);
});

productosRouter.get("/:id", (req, res) => {
  for (let producto of productos) {
    if (producto.id == req.params.id) {
      res.json(producto);
      return;
    }
  }
  //Not Found-Producto no encontrado
  res.status(404).send("El producto con id " + req.params.id + " no existe.");
});
//actualizar
productosRouter.put("/:id", (req, res) => {
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
    res.status(404).send("El producto con id " + req.params.id + " no existe.");
  }
});
//borrar
productosRouter.delete("/:id", (req, res) => {
  let indiceBorrar = _.findIndex(
    productos,
    (producto) => producto.id == req.params.id
  );
  if (indiceBorrar === -1) {
    res.status(404).send("El producto con id " + req.params.id + " no existe.");
  }
  let borrado = productos.splice(indiceBorrar, 1);
  res.status(200).json(borrado);
});

module.exports = productosRouter;
