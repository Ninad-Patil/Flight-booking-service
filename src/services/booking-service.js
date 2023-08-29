const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { serverConfig } = require("../config");
const appError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { Enums } = require("../utils/common");
const { BOOKED, INITIATED, CANCELLED, PENDING } = Enums.BOOKING_STATUS;

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
    //console.log(booking);
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

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(data.bookingId);
    if (bookingDetails.status == CANCELLED) {
      throw new appError("this bookig has expired", StatusCodes.BAD_REQUEST);
    }
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    if (currentTime - bookingTime > 300000) {
      await cancelBooking(data.bookingId);
      throw new appError(
        "the time limit for this booking has expired",
        StatusCodes.BAD_REQUEST
      );
    }
    if (bookingDetails.totalCost != data.totalCost) {
      throw new appError(
        "the payment amount doesnt match",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.userId != data.userId) {
      throw new appError(
        "the user does not match for the request",
        StatusCodes.BAD_REQUEST
      );
    }

    //we assume the payment to be successful
    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    error.statusCode = 400;
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId);
    if (bookingDetails.status == CANCELLED) {
      await transaction.commit();
      return true;
    }
    console.log(bookingDetails);
    await axios.patch(
      `${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noOfSeats,
        dec: 0,
      }
    );

    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );
    await transaction.commit();
  } catch (error) {
    error.statusCode = 400;
    await transaction.rollback();
    throw error;
  }
}

//user can complete the booking in 5 mins, after 5 mins cron job gets called.
async function cancelOldBookings() {
  try {
    const time = new Date(Date.now() - 1000 * 300); //time 5 mins ago
    const response = await bookingRepository.cancelOldBooking(time);
    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { createBooking, makePayment, cancelOldBookings };
