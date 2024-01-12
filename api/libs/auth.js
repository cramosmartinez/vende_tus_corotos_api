const passport = require("passport");
const log = require("../../utils/logger");
const usuarios = require("../../database").usuarios;
const bcrypt = require("bcryptjs");
const _ = require("underscore");

module.exports = (username, password, done) => {
  let index = _.findIndex(usuarios, (usuario) => {
    return usuario.username === username;
  });

  if (index === -1) {
    log.info(`Usuario ${username} no encontrado`);
    return done(null, false);
  }

  let hashedPassword = usuarios[index].password;

  bcrypt.compare(password, hashedPassword, (err, iguales) => {
    if (iguales) {
      log.info(`Usuario ${username} autenticado`);
      return done(null, true);
    } else {
      log.info(`Contraseña incorrecta para el usuario ${username}`);
      return done(null, false);
    }
  });
};
