const dotenv = require("dotenv");

//the moment you call dotenv.config it loads the port in global process obj
dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
};
