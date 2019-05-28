"use strict";

class CustomError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {Array.<Object>} errors
   */
  constructor(message, statusCode, errors) {
    super(message);

    errors = errors ? errors : [{ message: message }];
    this.name = "CustomError";
    this.statusCode = statusCode ? statusCode : 500;
    this.errors = errors;
  }
}

module.exports.CustomError = CustomError;
