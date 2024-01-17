const passport = require("passport");
const log = require("../../utils/logger");
const bcrypt = require("bcryptjs");
const _ = require("underscore");
const passportJWT = require("passport-jwt");
const config = require("../../config");
const usuariosController = require("../recursos/usuarios/usuarios.controller");

let jwtOptions = {
  secretOrKey: config.jwt.secreto,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
};
module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  usuariosController
    .obtenerUsuario({ id: jwtPayload.id })
    .then((usuario) => {
      if (!usuario) {
        log.info(
          `jwt token no es valido. Usuario con id ${jwtPayload.id} no existe`
        );
        next(null, false);
      }
      log.info(`Usuario ${usuario.username} esta autenticado`);
      next(null, { username: usuario.username, id: usuario.id });
    })
    .catch((error) => {
      log.error(`Error al obtener usuario: ${error.message}`);
      next(error, false);
    });
});
