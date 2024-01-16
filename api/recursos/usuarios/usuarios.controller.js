const Usuario = require("./usuarios.model.js");

function obtenerUsuarios() {
  return Usuario.find({});
}
function crearUsuario(usuario, hashedPassword) {
  return new Usuario({
    ...usuario,
    password: hashedPassword,
  }).save();
}
function usuarioExiste(usuario, email) {
  return new Promise((resolve, reject) => {
    Usuario.find()
      .or([{ username: usuario }, { email: email }])
      .then((usuarios) => {
        resolve(usuarios.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  usuarioExiste,    
};
