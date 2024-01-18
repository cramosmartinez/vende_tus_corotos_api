const log = require("../../utils/logger");

exports.procesarErrores = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((err) => {
      log.error("dentro de procesarErrores", err);
    });
  };
};

