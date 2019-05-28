"use strict";

class CustomValidator {
  /**
   * Type determination of character string
   * @param {string} value
   * @param {string} field
   * @param {string} message
   * @return {Object|null}
   */
  static isString(value, field = "value", message = null) {
    if (typeof value !== "string") {
      return {
        message: message
          ? message
          : `${field}Please enter the character string。`,
        field: field
      };
    }
    return null;
  }

  /**
   * Type determination of numbers
   * @param {string} value
   * @param {string} field
   * @param {string} message
   * @return {Object|null}
   */
  static isNumber(value, field = "value", message = null) {
    if (typeof value !== "number") {
      return {
        message: message ? message : `${field}Please enter a numeric value。`,
        field: field
      };
    }
    return null;
  }

  /**
   * Type determination of boolean values
   * @param {string} value
   * @param {string} field
   * @param {string} message
   * @return {Object|null}
   */
  static isBool(value, field = "value", message = null) {
    if (typeof value !== "boolean") {
      return {
        message: message ? message : `${field}Please enter the boolean。`,
        field: field
      };
    }
    return null;
  }

  /**
   * Type determination of array
   * @param {string} value
   * @param {string} field
   * @param {string} message
   * @return {Object|null}
   */
  static isArray(value, field = "value", message = null) {
    if (toString.call(value) !== "[object Array]") {
      return {
        message: message ? message : `${field} Please enter the array。`,
        field: field
      };
    }
    return null;
  }

  /**
   * Type determination of objects
   * @param {string} value
   * @param {string} field
   * @param {string} message
   * @return {Object|null}
   */
  static isObject(value, field = "value", message = null) {
    if (toString.call(value) !== "[object Object]") {
      return {
        message: message ? message : `${field}Please enter object。`,
        field: field
      };
    }
    return null;
  }

  /**
   * String length
   * @param {string} value
   * @param {string} min
   * @param {string} max
   * @param {string} field
   * @param {string} message
   * @return {Object|null}
   */
  static isLength(value, min = null, max = null, field = "value", message = null) {
    if (min === null && max === null) {
      return new Error(
        "Please set the limit value of the number of characters。"
      );
    }

    if (min === null) {
      if (!validator.isLength(value, { max: max })) {
        return {
          message: message
            ? message
            : `${field}は${max}Please enter in characters or less`,
          field: field
        };
      }
    } else if (max === null) {
      if (!validator.isLength(value, { min: min })) {
        return {
          message: message
            ? message
            : `${field}は${min}Please enter at least characters。`,
          field: field
        };
      }
    } else {
      if (!validator.isLength(value, { min: min, max: max })) {
        return {
          message: message
            ? message
            : `${field}は${min}~${max}Please enter with letters。`,
          field: field
        };
      }
    }

    return null;
  }
}

module.exports = CustomValidator;
