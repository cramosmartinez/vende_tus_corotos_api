const log = require("../../../utils/logger");
const Joi = require("joi");

const blueprintUsuario = Joi.object({
  username: Joi.string().min(3).max(100).alphanum().required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
});
const blueprintPedidoDeLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

let validarUsuario = (req, res, next) => {
  const resultado = blueprintUsuario.validate(req.body, {
    abortEarly: false,
    convert: false, // Cambiado a true para permitir la conversión de tipos
  });

  if (!resultado.error) {
    next();
  } else {
    log.info(
      "Producto fallo la validacion",
      (resultado.error.details || []).map((error) => error.message)
    );
    res
      .status(400)
      .send(
        "El usuario en el body debe especificar username, password y email."
      );
  }
};

let validarPedidoDeLogin = (req, res, next) => {
  const resultado = blueprintPedidoDeLogin.validate(req.body, {
    convert: false,
    abortEarly: false,
  });
  if (!resultado.error) {
    next();
  } else {
    res.status(400).send("El pedido de login no tiene los datos necesarios");
  }
};

module.exports = { validarUsuario, validarPedidoDeLogin };
