const log = require("../../utils/logger");
const mongoose = require("mongoose");

exports.procesarErrores = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

exports.procesarErroresDeDB = (err, req, res, next) => {
  if (err instanceof mongoose.Error || err.name === "MongoError") {
    log.error("Ocurrio un error relacionado a mongoose.", err);
    err.message =
      "Error relacionado con la base de datos. Para ayuda contacte con cramosmartinez5@gmail.com";
    err.status = 500;
  }
  next(err);
};

exports.erroresEnProduccion = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.massage,
  });
};
exports.erroresEnDesarrollo = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      message: err.message,
      stack: err.stack,
    },
  });
};
