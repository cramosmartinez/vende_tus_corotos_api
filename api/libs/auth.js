const passport = require("passport");
const log = require("../../utils/logger");
const usuarios = require("../../database").usuarios;
const bcrypt = require("bcryptjs");
const _ = require("underscore");
const passportJWT = require("passport-jwt");
const config = require("../../config");

let jwtOptions = {
  secretOrKey: config.jwt.secreto,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
};
module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  let index = usuarios.findIndex((usuario) => {
    return usuario.id === jwtPayload.id;
  });

  if (index === -1) {
    log.info(
      `jwt token no es valido. Usuario con id ${jwtPayload.id} no existe`
    );
    next(null, false);
  } else {
    log.info(`Usuario ${usuarios[index].username} esta autenticado`);
    next(null, { username: usuarios[index].username, id: usuarios[index].id });
  }
});
