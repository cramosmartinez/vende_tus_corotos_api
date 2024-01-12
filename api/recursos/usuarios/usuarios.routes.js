const _ = require("underscore");
const { v4: uuid } = require("uuid");

const log = require("../../../utils/logger");
const validarUsuario = require("./usuarios.validate");
const usuarios = require("../../../database").usuarios;
const usuariosRouter = require("express").Router();
const bcrypt = require("bcrypt");

usuariosRouter.get("/", (req, res) => {
  res.json(usuarios);
});

usuariosRouter.post("/", validarUsuario, (req, res) => {
  let nuevoUsuario = req.body;
  let indice = _.findIndex(usuarios, (usuario) => usuario.id == id);
  return (
    usuario.username === nuevoUsuario.username ||
    usuario.email === nuevoUsuario.email
  );
  if (indice != -1) {
    log.info("El usuario ya existe");
    res.status(409).send("El usuario ya existe");
  }

  bcrypt.hash(nuevoUsuario.password, 10, (err, hash) => {
    if (err) {
      log.error("Error al encriptar la contraseña");
      res.status(500).send("Error al encriptar la contraseña");
        return;
    }
    usuarios.push({
      username: nuevoUsuario.username,
      password: hashedPassword,
      email: nuevoUsuario.email,
    });
    log.info("Se creo un nuevo usuario", nuevoUsuario);
    //Creado
    res.status(201).json(nuevoUsuario);
  });
});
