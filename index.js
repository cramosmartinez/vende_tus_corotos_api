const express = require("express");
const bodyParser = require("body-parser");
const productosRouter = require("./api/recursos/productos/productos.routes");
const logger = require("./utils/logger");
const morgan = require("morgan");
const passport = require("passport");
const authJWT = require("./api/libs/auth");
const usuariosRouter = require("./api/recursos/usuarios/usuarios.routes");
const config = require("./config");
//autenticacion de constraseña y username
passport.use(authJWT);

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


app.listen(config.puerto, () => {
  logger.info("Escuchando el puerto 3000.");
});
