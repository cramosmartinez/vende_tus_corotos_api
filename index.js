const express = require("express");
const bodyParser = require("body-parser");
const productosRouter = require("./api/recursos/productos/productos.routes");
const logger = require("./utils/logger");
const morgan = require("morgan");
const passport = require("passport");
const authJWT = require("./api/libs/auth");
const usuariosRouter = require("./api/recursos/usuarios/usuarios.routes");
const config = require("./config");
const mongoose = require("mongoose");
const errorHandler = require("./api/libs/errorHandler");

//autenticacion de constraseña y username
passport.use(authJWT);

//MongoDB => NoSql = > no hay tablas, si no colecciones de documentos
mongoose.connect("mongodb://127.0.0.1:27017/vendetuscorotos", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(bodyParser.json());
app.use(
  morgan("short", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(passport.initialize());
//usamos el enrutador de productos
app.use("/productos", productosRouter);
app.use("/usuarios", usuariosRouter);

app.use(errorHandler.procesarErroresDeDB);
if (config.ambiente === "prod") {
  app.use(errorHandler.erroresEnProduccion);
} else {
  app.use(errorHandler.erroresEnDesarrollo);
}

app.listen(config.puerto, () => {
  logger.info("Escuchando el puerto 3000.");
});
