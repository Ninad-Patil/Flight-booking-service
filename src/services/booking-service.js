const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { serverConfig } = require("../config");
const appError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
async function createBooking(data) {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      const flight = await axios.get(
        `${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
      );
      //check for seats
      if (data.noOfSeats > flight.totalSeats) {
        throw new appError(
          "required no of seats not available",
          StatusCodes.BAD_REQUEST
        );
      }
      return true;
    });
  } catch (error) {
    //error.statusCode = 400;

    console.log(error);
    throw error;
  }
}
module.exports = { createBooking };
