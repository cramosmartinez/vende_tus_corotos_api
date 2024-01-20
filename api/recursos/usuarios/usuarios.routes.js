const _ = require("underscore");
const bcrypt = require("bcryptjs");
const express = require("express");
const log = require("../../../utils/logger");
const validarUsuario = require("./usuarios.validate").validarUsuario;
const usuariosRouter = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const usuariosController = require("./usuarios.controller");
const procesarErrores = require("../../libs/errorHandler").procesarErrores;
const {
  DatosDeUsuarioYaEnUso,
  CredencialesIncorrectas,
} = require("./usuarios.error");

const validarPedidoDeLogin =
  require("./usuarios.validate.js").validarPedidoDeLogin;

function transformarBodyALowerCase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
}

usuariosRouter.get(
  "/",
  procesarErrores((req, res) => {
    return usuariosController.obtenerUsuarios().then((usuarios) => {
      res.json(usuarios);
    });
  })
);

usuariosRouter.post(
  "/",
  [validarUsuario, transformarBodyALowerCase],
  procesarErrores((req, res) => {
    let nuevoUsuario = req.body;

    return usuariosController
      .usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
      .then((usuarioExiste) => {
        if (usuarioExiste) {
          log.warn(
            `Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen en la base de datos`
          );
          throw new DatosDeUsuarioYaEnUso();
        }

        return bcrypt.hash(nuevoUsuario.password, 10);
      })
      .then((hash) => {
        return usuariosController
          .crearUsuario(nuevoUsuario, hash)
          .then((nuevoUsario) => {
            res.status(201).send("Usuario creado exitósamente.");
          });
      });
  })
);

usuariosRouter.post(
  "/login",
  [validarPedidoDeLogin, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let usuarioNoAutenticado = req.body;

    let usuarioRegistrado = await usuariosController.obtenerUsuario({
      username: usuarioNoAutenticado.username,
    });
    if (!usuarioRegistrado) {
      log.info(
        `Usuario [${usuarioNoAutenticado.username}] no existe. No pudo ser autenticado`
      );
      throw new CredencialesIncorrectas();
    }

    let contraseñaCorrecta = await bcrypt.compare(
      usuarioNoAutenticado.password,
      usuarioRegistrado.password
    );
    if (contraseñaCorrecta) {
      let token = jwt.sign({ id: usuarioRegistrado.id }, config.jwt.secreto, {
        expiresIn: config.jwt.tiempoDeExpiracion,
      });
      log.info(
        `Usuario ${usuarioNoAutenticado.username} completo autenticación exitosamente.`
      );
      res.status(200).json({ token });
    } else {
      log.info(
        `Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta`
      );
      throw new CredencialesIncorrectas();
    }
  })
);

module.exports = usuariosRouter;
