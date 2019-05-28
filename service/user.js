'use strict'

const Model = require("../models/user");
const Token = require("../models/token");
const AbstractService = require("./abstract");
const Util = require("../utils/util");
const CustomErrors = require("../utils/customErrors");
const Email = require("../utils/email");
const CustomError = CustomErrors.CustomError;

class UserService extends AbstractService {

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

      const userDetail = await Model.getLoginedId(token.PK);
      const userType = await Model.getByEmail(token.email);
      if (userType.type != Model.type.user && userType.type != Model.type.admin) {
        throw new CustomError(
          "User Type is wrong。", 403);
      }
      console.log("USER>>>>",userDetail);

      return userDetail;
    } catch (error) {
      super.throwCustomError(error, "Certification failed。");
    }
  }

  /**
   * user signup
   * @param {Object} params
   * @return {Object}
   */
  static async signup(params) {
    try {
      const oldUser = await Model.getByEmail(params.body.email);
      console.log(oldUser);
      
      if (oldUser != undefined) {
        throw new CustomError("This email is already registered 。", 409);
      }

      const user = await Model.create(params.body);
      
      await Email.send(user.email);

      return super.success(null, {
        user: user
      });
    } catch (error) {

      return super.failed(error, "An error occoured while sign up procressing。");
    }
  }

  /**
   * Login
   * @param {Object} params
   * @return {Object}
   */
  static async login(params) {
    try {
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
    } catch (error) {

      return super.failed(error, "An error occoured while login procressing。");
    }
  }

  /**Logout
	 * @param {Object} 
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
      
      return super.failed(error);
    }
  }

  static async userById(params) {
    try {
      const userById = await Model.getById(params.path.userId);

      return super.success(null, {
        user: userById
      });
    } catch (error) {

      return super.failed(error);
    }
  }
}

module.exports = UserService;
