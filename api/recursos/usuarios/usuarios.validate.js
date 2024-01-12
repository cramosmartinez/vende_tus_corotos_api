const log = require("../../../utils/logger");
const Joi = require("joi");

const blueprintUsuario = Joi.object({
  username: Joi.string().min(3).max(100).alphanum().required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
});

let validarUsuario = (req, res, next) => {
  const resultado = blueprintUsuario.validate(req.body, {
    abortEarly: false,
    convert: true, // Cambiado a true para permitir la conversión de tipos
  });

  if (!resultado.error) {
    next();
  } else {
    log.info(
      "Producto fallo la validacion",
      resultado.error.details.map(error => error.message)
    );
    res
      .status(400)
      .send(
        "El usuario en el body debe especificar username, password y email."
      );
  }
}
const bluprintPedidoDeLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
let validarPedidoDeLogin = (req, res, next) => {
  const resultado = bluprintPedidoDeLogin.validate(req.body, {
    convert: true,
    abortEarly: false,
  });

  if (resultado.error === null) {
    next();
  } else {
    log.info(
      "El pedido de login no tiene los datos necesarios",
      resultado.error.details.map((error) => error.message)
    );
    res.status(400).send("El pedido de login no tiene los datos necesarios");
  }
}


module.exports = { validarUsuario, validarPedidoDeLogin };