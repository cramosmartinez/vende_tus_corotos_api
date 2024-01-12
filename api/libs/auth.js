const passport = require("passport");
const log = require("../../utils/logger");
const usuarios = require("../../database").usuarios;
const bcrypt = require('bcryptjs');


module.exports = (username, password, done) => {
  if (username.valueOf() === "Carlos" && password.valueOf() === "1234") {
    return done(null, true);
  } else {
    return done(null, false);
  }
};
