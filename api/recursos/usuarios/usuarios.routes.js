const _ = require("underscore");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const express = require("express");
const log = require("../../../utils/logger");
const validarUsuario = require("./usuarios.validate").validarUsuario;
const usuarios = require("../../../database").usuarios;
const usuariosRouter = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const usuariosController = require("./usuarios.controller");

const validarPedidoDeLogin =
  require("./usuarios.validate.js").validarPedidoDeLogin;

usuariosRouter.get("/", (req, res) => {
  usuariosController
    .obtenerUsuarios()
    .then((usuarios) => {
      res.json(usuarios);
    })
    .catch((err) => {
      res.status(500).send("Error al obtener los usuarios");
      log.error("Error al obtener los usuarios", err);
    });
});

usuariosRouter.post("/", validarUsuario, (req, res) => {
  let nuevoUsuario = req.body;
  usuariosController
    .usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
    .then((usuarioExiste) => {
      if (usuarioExiste) {
        res.status(400).send("Usuario o email ya existen");
        return;
      }
      bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
        if (err) {
          res.status(500).send("Error al crear usuario");
          log.error("Error al crear usuario", err);
        }
        usuariosController
          .crearUsuario(nuevoUsuario, hashedPassword)
          .then((usuario) => {
            res.status(201).json(usuario);
          })
          .catch((err) => {
            res.status(500).send("Error al crear usuario");
            log.error("Error al crear usuario", err);
          });
      });
    });
});

usuariosRouter.post("/login", validarPedidoDeLogin, (req, res) => {
  let usuarioNoAutenticado = req.body;

  let index = _.findIndex(usuarios, (usuario) => {
    return usuario.username === usuarioNoAutenticado.username;
  });

  if (index === -1) {
    log.info(`Usuario ${usuarioNoAutenticado.username} no encontrado`);
    return res.status(401).send("Usuario no encontrado");
  }

  let hashedPassword = usuarios[index].password;

  bcrypt.compare(
    usuarioNoAutenticado.password,
    hashedPassword,
    (err, iguales) => {
      if (iguales) {
        let token = jwt.sign({ id: usuarios[index].id }, config.jwt.secreto, {
          expiresIn: config.jwt.tiempoDeExpiracion,
        });
        log.info(`Usuario ${usuarioNoAutenticado.username} ha iniciado sesión`);
        res.status(200).json({ jwt: token });
      } else {
        log.info(
          `Contraseña incorrecta para usuario ${usuarioNoAutenticado.username}`
        );
        res.status(401).send("Contraseña incorrecta");
      }
    }
  );
});

module.exports = usuariosRouter;
