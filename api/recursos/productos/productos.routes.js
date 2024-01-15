const express = require("express");
const _ = require("underscore");
const productos = require("../../../database").productos;
const productosRouter = express.Router();
const validarProducto = require("./productos.validate");
const log = require("../../../utils/logger");
const passport = require("passport");
const productoController = require("./productos.controller");
const jwtAuthhenticate = passport.authenticate("jwt", { session: false });

function validarId(req, res, next) {
  let id = req.params.id;
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send("El id no es valido");
    return;
  }
  next();
}

//Listar
productosRouter.get("/", (req, res) => {
  productoController
    .obtenerProductos()
    .then((productos) => {
      res.json(productos);
    })
    .catch((err) => {
      res.status(500).send("Error al obtener los productos");
    });
});
//localhost:3000/productos
//crear
productosRouter.post("/", [jwtAuthhenticate, validarProducto], (req, res) => {
  productoController
    .crearProducto(req.body, req.user.username)
    .then((producto) => {
      log.info("Se creo un nuevo producto", producto);
      res.status(201).json(producto);
    })
    .catch((err) => {
      log.error("Error al crear un producto", err);
      res.status(500).send("Error al crear un producto");
    });
});

productosRouter.get("/:id", validarId, (req, res) => {
  let id = req.params.id;
  productoController
    .obtenerProducto(id)
    .then((producto) => {
      if (!producto) {
        res
          .status(404)
          .send("El producto con id " + req.params.id + " no existe.");
      } else {
        res.json(producto);
      }
    })
    .catch((err) => {
      log.error("Error al obtener el producto", err);
      res.status(500).send("Error al obtener el producto");
    });
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
