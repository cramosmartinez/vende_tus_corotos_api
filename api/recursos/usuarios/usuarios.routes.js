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

function transformarBodyALowerCase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
}

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

usuariosRouter.post(
  "/",
  [validarUsuario, transformarBodyALowerCase],
  (req, res) => {
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
  }
);

usuariosRouter.post(
  "/login",
  [validarPedidoDeLogin, transformarBodyALowerCase],
  async (req, res) => {
    let usuarioNoAutenticado = req.body;
    let usuariosRegistrado;
    try {
      usuariosRegistrado = await usuariosController.obtenerUsuarios({
        username: usuarioNoAutenticado.username,
      });
    } catch (err) {
      log.error("Error al obtener usuarios", err);
      return res.status(500).send("Error al obtener usuarios");
    }
    if (!usuariosRegistrado) {
      log.info(`Usuario ${usuarioNoAutenticado.username} no encontrado`);
      return res.status(401).send("Usuario no encontrado");
    }
    let contraseñaCorrecta;
    try {
      contraseñaCorrecta = await bcrypt.compare(
        usuarioNoAutenticado.password,
        usuariosRegistrado[0].password
      );
    } catch (err) {
      log.error("Error al comparar contraseñas", err);
      return res.status(500).send("Error al comparar contraseñas");
    }
    if (contraseñaCorrecta) {
      let token = jwt.sign(
        {
          id: usuariosRegistrado[0].id,
          username: usuariosRegistrado[0].username
        },
        config.jwt.secreto,
        {
          expiresIn: config.jwt.tiempoDeExpiracion,
        }
      );
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

module.exports = usuariosRouter;
