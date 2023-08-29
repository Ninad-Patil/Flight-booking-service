const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { successResponse, ErrorResponse } = require("../utils/common");
const inMemDb = {};
async function createBooking(req, res) {
  try {
    const response = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noOfSeats: req.body.noOfSeats,
    });
    successResponse.data = response;
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    //console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

async function makePayment(req, res) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];
    if (!idempotencyKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "no idempotency key" });
    }
    if (inMemDb[idempotencyKey]) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "cannot retry on a successful payment" });
    }

    const response = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    successResponse.data = response;
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    //console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createBooking,
  makePayment,
};
