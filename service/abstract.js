"use strict";

const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class AbstractService {
  /**
   * Create response on success.
   * @param {number} statusCode
   * @param {Object} result
   * @param {Object} headers
   * @return {Object}
   */
  static success(statusCode, result, headers) {
    console.log(result);
    if (!statusCode) {
      statusCode =
        result === "" || result === null || result === undefined ? 204 : 200;
    }
    const response = {
      body: {
        statusCode: statusCode,
        errors: ['No error'],
        message: "Process Success!!"
      },
      headers: headers
    };
    if (typeof result === "object") {
      response.body = { ...response.body, ...result };
    }
    
    return response;
  }

  /**
   * Create a response at the time of failure.
   * @param {Error|CustomError}
   * @param {string} message
   * @param {number} statusCode
   * @param {Array.<Object>} errors
   * @param {Object} headers
   * @return {Object}
   */
  static failed(error, message, statusCode, errors, headers) {
    if (!statusCode) {
      statusCode = 500;
    }
    let customError;
    if (error instanceof CustomError) {
      customError = error;
    } else {
      customError = new CustomError(message, statusCode, errors);
    }
    const response = {
      body: {
        statusCode: customError.statusCode,
        errors: customError.errors
      },
      headers: headers
    };
    
    return response;
  }

  /**
   *If a CustomError object is passed, throw it as is. Otherwise, create a CustomError object and throw it.
   * @param {CustomError|Error} error
   * @param {string} message
   * @param {number} statusCode
   * @param {Array.<Object>} errors
   * @throws {CustomError}
   */
  static throwCustomError(error, message, statusCode, errors) {
    if (!statusCode) {
      statusCode = 500;
    }
    if (error instanceof CustomError) {
      throw error;
    } else {
      console.log(error);
      throw new CustomError(message, statusCode, errors);
    }
  }
}

module.exports = AbstractService;
