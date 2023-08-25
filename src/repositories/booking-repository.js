const { StatusCodes } = require("http-status-codes");
const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    console.log("in repo", data);
    const response = await Booking.create(data, {
      transaction: transaction,
    });
    return response;
  }
}

module.exports = BookingRepository;
