"use strict";
const Model = require("../models");
const AbstractService = require("./abstract");

class GenreService extends AbstractService {
 
  /**
   * create book
   */
  static async register(params) {      
    try {
      const userBody = {
        ...params.body
      };
      const userHeader = {
        ...params.headers
      };
      const currentUser = params.currentUser
      const book = await Model.Book.create(userBody, userHeader, currentUser);
  
      return super.success(null, {
          book: book
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred during the process of creating the book"
      );
    }   
  }

  /**
   * get books
   * @return {Array.Object}
   */
  static async getBooks() {
    try {
      const books = await Model.Book.getAll();
      
      return super.success(null, {
        books: books
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occoured in getting books"
      );
    }
  }

  /**
   *Get book by id
   * @param {ID}
   * @return {Object}
   */
  static async getBook(params) {
    try {
      const bookId = await Model.Book.getById(params.path.bookId);

      return super.success(null, {
        book: bookId
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred while acquiring the book by id"
      );
    }
  }

  /**
   *Get book by name
   * @return {Object}
   */
  static async getBookByName(params) {
    try {
      const bookName = await Model.Book.getByName(params.body.name);

      return super.success(null, {
        book: bookName
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred while acquiring the book by name。"
      );
    }
  }

  /**
   * Update book
   * @param {bookId}
   * @return {Object}
   */
  static async updateBook(params) {    
    try {
      const body = {
          bookId: params.path.bookId,
          ...params.body
          };
      const currentUser = params.currentUser;
      const book = await Model.Book.update(body, currentUser);

      return super.success(null, {
          book: book
      });
    } catch (error) {
      return super.failed(error, "An error while updating the book");
    }
  }

  /**
   * Delete book
   * @param {genreId}
   * @return {Object}
   */
  static async deleteBook(params) {
    try {
      const book = await Model.Book.delete(
        params.path.bookId
      );

      return super.success(null, {
        book: book
      });
    } catch (error) {
      return super.failed(error, "Error occoured while deleting the book.");
    }
  }
}

module.exports = GenreService;
