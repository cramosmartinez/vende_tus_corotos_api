const joi = require("joi");
const { log } = require("../../../utils/logger");
const { min } = require("underscore");
const Joi = require("joi");

const blueprintUsuario = joi.object({
  username: joi.string().min(3).max(100).alphanum().required(),
  password: joi.string().min(8).required(),
  email: joi.string().email().required(),
});

module.exports = (req, res, next) => {
  const resultado = Joi.validate(req.body, blueprintUsuario, {
    abortEarly: false,
    convert: true,
  });
  if (!resultado.error) {
    next();
  } else {
    log.warn(
      "El usuario no cumple con el formato requerido. Detalles: " +
        resultado.error.details.reduce((acc, error) => {
          return acc + `[${error.message}]`;
        }, "")
    );
    res.status(400).send("El usuario no cumple con el formato requerido");
  }
};
