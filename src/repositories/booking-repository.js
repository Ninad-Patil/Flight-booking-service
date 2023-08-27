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

  async get(data, transaction) {
    const response = await Booking.findByPk(data, {
      transaction: transaction,
    });

    //since common for all hence written here, also can go in individual service layer
    if (!response) {
      throw new appError(
        "the requested entity is not found",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await Booking.update(
      data,
      {
        where: {
          id: id,
        },
      },
      { transaction: transaction }
    );
    return response;
  }
}

module.exports = BookingRepository;
