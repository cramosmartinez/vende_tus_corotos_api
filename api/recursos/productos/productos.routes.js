const express = require("express");
const _ = require("underscore");
const productos = require("../../../database").productos;
const productosRouter = express.Router();
const { v4: uuid } = require("uuid");
const validarProducto = require("./productos.validate");
const log = require("../../../utils/logger");
const passport = require("passport");
const Producto = require("./productos.model");
const jwtAuthhenticate = passport.authenticate("jwt", { session: false });
//Listar
productosRouter.get("/", (req, res) => {
  res.json(productos);
});
//localhost:3000/productos
//crear
productosRouter.post("/", [jwtAuthhenticate, validarProducto], (req, res) => {
  new Producto({
    ...req.body,
    dueño: req.user.username,
  })
    .save()
    .then((producto) => {
      log.info("Se creo un nuevo producto", producto);
      res.status(201).json(producto);
    })
    .catch((err) => {
      log.err("Error al crear un producto", err);
      res.status(500).send("Error al crear un producto");
    });
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
productosRouter.put("/:id", [jwtAuthhenticate, validarProducto], (req, res) => {
  let remplazoParaProducto = {
    ...req.body,
    id: req.params.id,
    dueño: req.user.username,
  };
  let indice = _.findIndex(
    productos,
    (producto) => producto.id == remplazoParaProducto.id
  );
  if (indice != -1) {
    if (productos[indice].dueño != req.user.username) {
      log.info(
        "Usuario ${req.user.username} intento editar un producto con id ${remplazoParaProducto.id} que no le pertenece"
      );
      res.status(403).send("No tiene permisos para editar este producto");
      return;
    }
    productos[indice] = remplazoParaProducto;
    log.info(
      "Se actualizo un producto ${remplazoParaProducto.id}",
      remplazoParaProducto
    );
    res.status(200).json(remplazoParaProducto);
  } else {
    res.status(404).send("El producto con id " + req.params.id + " no existe.");
  }
});
//borrar
productosRouter.delete("/:id", jwtAuthhenticate, (req, res) => {
  let indiceBorrar = _.findIndex(
    productos,
    (producto) => producto.id == req.params.id
  );
  if (indiceBorrar === -1) {
    log.warn("Se intento borrar un producto que no existe");
    res.status(404).send("El producto con id " + req.params.id + " no existe.");
  }
  if (productos[indiceBorrar].dueño != req.user.username) {
    log.info(
      "Usuario ${req.user.username} intento borrar un producto con id ${req.params.id} que no le pertenece"
    );
    res.status(403).send("No tiene permisos para borrar este producto");
    return;
  }

  let borrado = productos.splice(indiceBorrar, 1);
  res.status(200).json(borrado);
});

module.exports = productosRouter;
