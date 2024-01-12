const log = require("../../../utils/logger");
const Joi = require("joi");

const blueprintUsuario = Joi.object({
  username: Joi.string().min(3).max(100).alphanum().required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
});

module.exports = (req, res, next) => {
  let resultado = blueprintUsuario.validate(req.body, {
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
};
