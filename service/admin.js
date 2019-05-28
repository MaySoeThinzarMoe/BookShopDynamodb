'use strict'

const Model = require("../models/user");
const Token = require("../models/token");
const AbstractService = require("./abstract");
const Util = require("../utils/util");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class AdminService extends AbstractService {

  /**
   * User authentication with access token
   * @param {Object} params
   */
  static async authenticate(params) {
    try {
        const accessToken = Util.getAccessToken(params);
        if (!accessToken) {
          throw new CustomError("Please Login with token。", 403);
        }

        const token = await Token.getByTokenString(accessToken);
        console.log("token------", token);

        if (token == null) {
          throw new CustomError(
            "An access token that does not exist is being sent。", 403);
        }

        const adminDetail = await Model.getAdminDetailById(token.PK);
        const user = await Model.getByEmail(token.email);

        if (user.type != Model.type.admin) {
          throw new CustomError(
            "User Type is wrong。", 403);
        }
      
	      return adminDetail;
    } catch (error) {
      super.throwCustomError(error, "Certification failed。");
    }
  }

  /**
   * Login
   * @param {Object} params
   * @return {Object}
   */
  static async login(params) {
    const user = await Model.getByLogin(
      params.body.email,
      params.body.password
    );

    if (user == null) {
      throw new CustomError("Email or password is wrong。", 404);
    } 

    const tokenString = Util.randomString(64);
    await Model.saveLoginedId(user.PK, user.email, tokenString);

    return super.success(null, {
      user: user,
      token: tokenString
    });
  }
  
  /**
  * Logout
  * @param {Object} params
  * @return {null}
  */
  static async logout(params) {
    try {
      const tokenString = Util.getAccessToken(params);
      const token = await Token.delete(tokenString);

      return super.success(200, {
        token: token
      });
    } catch (error) {
      return super.failed(error,"An error occoured while logout procressing。");
    }
  }
}

module.exports = AdminService;
