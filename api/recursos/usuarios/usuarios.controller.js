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

function obtenerUsuario({ 
  username: username, 
  id: id 
}) {
  if (username) return Usuario.findOne({ username: username });
  if (id) return Usuario.findById(id);
  throw new Error(
    "Funcion obtenerUsuario del controller fue llamada sin especificar username o id"
  );
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
