"use strict";

class Util {
  /**
   * Generate a random character string.
   * @param {number} len String length
   * @return {string} Generated string
   */
  static randomString(len = 16) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const cl = chars.length;
    let str = "";
    for (let i = 0; i < len; i++) {
      str += chars[Math.floor(Math.random() * cl)];
    }

    return str;
  }

  /**
   * Get the value of the header. The entered header name is also searched for lowerCase。
   * @param {string} properName 
   * @param {Object} headers 
   * @return {string|number|null} 
   **/
  static getHeader(properName, headers) {
    const value = headers[properName]
      ? headers[properName]
      : headers[properName.toLowerCase()];

    return value ;
  }

  /**
   * get access token
   * @param {Object} params 
   * @return {string|null} 
   */
  static getAccessToken(params) {
    const authorization = Util.getHeader("Authorization", params.headers);
    
    return authorization ? authorization.replace(/^token /, "") : null;
  }
}

module.exports = Util;
