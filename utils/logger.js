const winston = require("winston");
const config = require("../config");

//winson para logs
const incluirFecha = winston.format((info) => {
  info.message = `${new Date().toISOString()} ${info.message}`;
  return info;
});
module.exports = logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: config.suprimirLogs ? "error" : "debug",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      level: "info",
      filename: "logs.log",
      handleExceptions: true,
      format: winston.format.combine(incluirFecha(), winston.format.simple()),
      maxsize: 5120000, //5mb
      maxFiles: 5,
      filename: "${__dirname}/../logs/logs-de-aplicacion.log",
    }),
  ],
});
