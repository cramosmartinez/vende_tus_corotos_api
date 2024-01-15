const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "Producto debe tener un nombre"],
  },
  precio: {
    type: Number,
    min: [0, "Precio no puede ser negativo"],
    required: [true, "Producto debe tener un precio"],
  },
  moneda: {
    type: String,
    maxlength: 3,
    minlength: 3,
    required: [true, "Producto debe tener una moneda"],
  },
  dueño: {
    type: String,
    required: [true, "Producto debe tener un dueño"],
  },
});

module.exports = mongoose.model("Producto", productoSchema);
