"use strict";
const Model = require("../models");
const AbstractService = require("./abstract");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class AuthorService extends AbstractService {
 
  /**
   * create author
   */
  static async register(params) { 
    try {
      const userBody = {
        ...params.body
      };
      const userHeader = {
        ...params.headers
      };
      const sameName = await Model.Author.getByName(params.body.name);
      if( sameName.Items[0] != undefined || sameName.Items[0] != null) {
        throw new CustomError("Error :: Same author name....... 。", 409);
      }

      const currentUser = params.currentUser;
      const author = await Model.Author.create(userBody, userHeader, currentUser);

      return super.success(null, {
        author: author
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred during the process of creating the author。"
      );
    }     
  }

  /**
   * get authors
   * @param {Object}
   * @return {Array.Object}
   */
  static async getAuthors(params) {    
    try {
      const author = await Model.Author.getAll(params.currentUser.PK);

      return super.success(null, {
        author: author
      });;
    } catch (error) {
      return super.failed(
        error,
        "An error occoured in getting authors"
      );
    }
  }

  /**
   *Get author by id
   * @param {ID}
   * @return {Object}
   */
  static async getAuthor(params) {
    try {
      const authorId = await Model.Author.getById(params.path.authorId);

      return super.success(null, {
        author: authorId
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred while acquiring the author by id。"
      );
    }
  }

  /**
   *Get author by name
   * @return {Object}
   */
  static async getAuthorByName(params) {
    try {
      const authorName = await Model.Author.getByName(params.body.name);

      return super.success(null, {
        author: authorName
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred while acquiring the author by name"
      );
    }
  }

  /**
   * Update author
   * @param {ID}
   * @return {Object}
   */
  static async updateAuthor(params) { 
    try {
      const currentUser = params.currentUser;
      const body = {
        authorId: params.path.authorId,
        ...params.body
        };
      const author = await Model.Author.update(body,currentUser);

      return super.success(null, {
      author: author
      }); 
    } catch (error) {
      return super.failed(
        error, 
        "An error while updating the author"
      );
    }
  }

  /**
   * Delete author
   * @param {ID}
   * @return {Object}
   */
  static async deleteAuthor(params) {
    try {
      const author = await Model.Author.delete(
        params.path.authorId
      );

      return super.success(null, {
        author: author
      });
    } catch (error) {
      return super.failed(
        error, 
        "Error occoured while deleting the author.");
    }
  }
}

module.exports = AuthorService;
