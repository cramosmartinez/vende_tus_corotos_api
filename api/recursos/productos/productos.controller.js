const Producto = require("./productos.model");

function crearProducto(producto, dueño) {
  return new Producto({
    ...producto,
    dueño,
  }).save();
}
function obtenerProductos() {
  return Producto.find({});
}

function obtenerProducto(id) {
  return Producto.findById(id);
}

function borrarProducto(id) {
  return Producto.findByIdAndDelete(id);
}

function remplazarProducto(id, producto, username) {
  return Producto.findOneAndUpdate(
    { _id: id },
    { ...producto, dueño: username },
    { new: true, useFindAndModify: false }
  );
}

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  borrarProducto,
  remplazarProducto,
};
