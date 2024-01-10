const express = require("express");
const bodyParser = require("body-parser");
const productosRouter = require("./api/recursos/productos/productos.routes");
const logger = require("./utils/logger");
const morgan = require("morgan");


const app = express();
app.use(bodyParser.json());
app.use(morgan("short", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

//usamos el enrutador de productos
app.use("/productos", productosRouter);

//sevidor corriendo super basico
app.get("/", (req, res) => {
  res.send("Api de vendetuscorotos.com.");
});
app.listen(3000, () => {
  logger.info("Escuchando el puerto 3000.");
});
