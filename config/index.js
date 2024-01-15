const ambiente = process.env.NODE_ENV || "development";
const configuraciónBase = {
  jwt: {},
  puerto: 3000,
};

let configuracionDeAmbiente = {};
switch (ambiente) {
  case "desarrollo":
  case "dev":
  case "development":
    configuracionDeAmbiente = require("./dev");
    break;
  case "produccion":
  case "prod":
    configuracionDeAmbiente = require("./prod");
    break;
  default:
    configuracionDeAmbiente = require("./dev");
    break;
}

module.exports = {
  ...configuraciónBase,
  ...configuracionDeAmbiente,
};
