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
productosRouter.put(
  "/:id",
  [jwtAuthhenticate, validarProducto],
  async (req, res) => {
    let id = req.params.id;
    let requestUsuario = req.user.username;
    let productoARemplazar;
    try {
      productoARemplazar = await productoController.obtenerProducto(id);
    } catch (err) {
      log.warn("Error al obtener el producto", err);
      return res.status(500).send("Error al obtener el producto");
    }
    if (!productoARemplazar) {
      res
        .status(404)
        .send("El producto con id " + req.params.id + " no existe.");
      return;
    }
    if (productoARemplazar.dueño != requestUsuario) {
      log.warn(
        "Usuario ${req.user.username} intento editar un producto con id ${req.params.id} que no le pertenece"
      );
      res.status(401).send("No eres el dueño de este producto");
      return;
    }
    productoController
      .remplazarProducto(id, req.body, requestUsuario)
      .then((producto) => {
        log.info("Se actualizo un producto", producto.toObject);
        res.status(200).json(producto);
      })
  }
);
//borrar
productosRouter.delete(
  "/:id",
  jwtAuthhenticate,
  validarId,
  async (req, res) => {
    let id = req.params.id;
    let productoABorrar;
    try {
      productoABorrar = await productoController.obtenerProducto(id);
    } catch (err) {
      log.error("Error al obtener el producto", err);
      return res.status(500).send("Error al obtener el producto");
    }

    if (!productoABorrar) {
      log.info("Se intentó borrar un producto que no existe");
      return res
        .status(404)
        .send("El producto con id " + req.params.id + " no existe.");
    }

    let usuarioAutenticado = req.user.username;
    if (productoABorrar.dueño != usuarioAutenticado) {
      log.info(
        `Usuario ${req.user.username} intentó borrar un producto con id ${productoABorrar.id} que no le pertenece`
      );
      return res
        .status(403)
        .send("No tiene permisos para borrar este producto");
    }

    try {
      let productoBorrado = await productoController.borrarProducto(id);
      log.info("Se borró un producto", productoABorrar);
      res.json(productoBorrado);
    } catch (err) {
      log.error("Error al borrar el producto", err);
      res.status(500).send("Error al borrar el producto");
    }
  }
);

module.exports = productosRouter;
