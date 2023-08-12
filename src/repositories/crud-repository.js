const { logger } = require("../config");
const { StatusCodes } = require("http-status-codes");
const appError = require("../utils/errors/app-error");

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const response = await this.model.create(data);
    return response;
  }

  async destroy(data) {
    const response = await this.model.destroy({
      where: {
        id: data,
      },
    });
    if (!response) {
      throw new appError(
        "the requested entity is not found",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async get(data) {
    const response = await this.model.findByPk(data);

    //since common for all hence written here, also can go in individual service layer
    if (!response) {
      throw new appError(
        "the requested entity is not found",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async getAll(data) {
    const response = await this.model.findAll();
    return response;
  }

  async update(id, data) {
    const response = await this.model.update(data, {
      where: {
        id: id,
      },
    });
    return response;
  }
}

module.exports = CrudRepository;
