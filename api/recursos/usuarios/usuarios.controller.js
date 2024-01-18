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

function obtenerUsuario({ username, id }) {
  return new Promise((resolve, reject) => {
    if (username) {
      resolve(Usuario.findOne({ username: username }));
    } else if (id) {
      resolve(Usuario.findById(id));
    } else {
      reject(
        new Error(
          "La función obtenerUsuario fue llamada sin especificar username o id"
        )
      );
    }
  });
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
  obtenerUsuario,
};
