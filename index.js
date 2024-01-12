const express = require("express");
const bodyParser = require("body-parser");
const productosRouter = require("./api/recursos/productos/productos.routes");
const logger = require("./utils/logger");
const morgan = require("morgan");
const passport = require("passport");
//autenticacion de constraseña y username
const BasicStrategy = require("passport-http").BasicStrategy;
passport.use(
  new BasicStrategy((username, password, done) => {
    if (username.valueOf() === "Carlos" && password.valueOf() === "1234") {
      return done(null, true);
    } else {
      return done(null, false);
    }
  })
);

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

//sevidor corriendo super basico
app.get("/", passport.authenticate("basic", { session: false }), (req, res) => {
  res.send("Api de vendetuscorotos.com.");
});
app.listen(3000, () => {
  logger.info("Escuchando el puerto 3000.");
});
