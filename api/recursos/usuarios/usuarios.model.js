const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 1,
    required: [true, "Usuario debe tener un nombre"],
  },
  email: {
    type: String,
    minlength: 1,
    required: [true, "Usuario debe tener un email"],
  },
  password: {
    type: String,
    required: [true, "Usuario debe tener un password"],
  },
});
module.exports = mongoose.model("usuario", usuarioSchema);
