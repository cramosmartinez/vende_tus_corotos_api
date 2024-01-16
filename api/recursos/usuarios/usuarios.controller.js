const Usuario = require("./usuarios.model.js");

function obtenerUsuarios() {
  return Usuario.find({});
}

module.exports = {
  obtenerUsuarios,
};
