const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { serverConfig } = require("../config");
const appError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

const bookingRepository = new BookingRepository();
async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
    );
    const flightData = flight.data.data;
    //check for seats
    if (data.noOfSeats > flightData.totalSeats) {
      throw new appError(
        "required no of seats not available",
        StatusCodes.BAD_REQUEST
      );
    }

    const totolBillingAmount = data.noOfSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totolBillingAmount };
    console.log(bookingPayload);
    const booking = await bookingRepository.create(bookingPayload, {
      transaction: transaction,
    });
    console.log(booking);
    await axios.patch(
      `${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noOfSeats,
      }
    );
    await transaction.commit();
    return booking;
  } catch (error) {
    error.statusCode = 400;
    await transaction.rollback();
    throw error;
  }
}
module.exports = { createBooking };
