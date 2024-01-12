const _ = require("underscore");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const express = require("express"); // Añade esta línea para importar express
const log = require("../../../utils/logger");
const validarUsuario = require("./usuarios.validate");
const usuarios = require("../../../database").usuarios;
const usuariosRouter = express.Router();

usuariosRouter.get("/", (req, res) => {
  res.json(usuarios);
});

usuariosRouter.post("/", validarUsuario, (req, res) => {
  let nuevoUsuario = req.body;
  // Buscar si el usuario ya existe
  let indice = _.findIndex(usuarios, (usuario) => {
    return (
      usuario.username === nuevoUsuario.username ||
      usuario.email === nuevoUsuario.email
    );
  });

  if (indice !== -1) {
    log.info("El usuario ya existe");
    return res.status(409).send("El usuario ya existe");
  }

  bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
    if (err) {
      log.error("Error al encriptar la contraseña");
      return res.status(500).send("Error al encriptar la contraseña");
    }

    usuarios.push({
      username: nuevoUsuario.username,
      password: hashedPassword,
      email: nuevoUsuario.email,
    });
    log.info("Se creó un nuevo usuario", nuevoUsuario);
    // Creado
    res.status(201).json(nuevoUsuario);
  });
});

module.exports = usuariosRouter;
