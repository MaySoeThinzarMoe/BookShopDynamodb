"use strict";
const Model = require("../models");
const AbstractService = require("./abstract");

class GenreService extends AbstractService {
 
  /**
   * create genre
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
      const genre = await Model.Genre.create(userBody, userHeader, currentUser);
  
      return super.success(null, {
          genre: genre
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred during the process of creating the genre"
      );
    } 
  }

  /**
   * get genres
   * @return {Array.Object}
   */
  static async getGenres() {
    try {
      const genres = await Model.Genre.getAll();

      return super.success(null, {
        genres: genres
      });
    } catch (error) {
      return super.failed(
        error, 
        "An error occoured in getting genres"
      );
    }
  }

  /**
   *Get genre by id
   * @param {ID}
   * @return {Object}
   */
  static async getGenre(params) {
    try {
      const genreId = await Model.Genre.getById(params.path.genreId);

      return super.success(null, {
        genre: genreId
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred while acquiring the genre by id。"
      );
    }
  }
  
  /**
   *Get genre by name
   * @return {Object}
   */
  static async getGenreByName(params) {
    try {
      const genreName = await Model.Genre.getByName(params.body.name);

      return super.success(null, {
        genre: genreName
      });
    } catch (error) {
      return super.failed(
        error,
        "An error occurred while acquiring the genre by name。"
      );
    }
  }

  /**
   * Update genre
   * @param {genreId}
   * @return {Object}
   */
  static async updateGenre(params) {    
    try {
        const body = {
            genreId: params.path.genreId,
            ...params.body
            };
        const currentUser = params.currentUser
        const genre = await Model.Genre.update(body,currentUser);

        return super.success(null, {
            genre: genre
        });
    } catch (error) {
      return super.failed(error, "An error while updating the genre");
    }
  }

  /**
   * Delete genre
   * @param {genreId}
   * @return {Object}
   */
  static async deleteGenre(params) {
    try {
      const genre = await Model.Genre.delete(
        params.path.genreId
      );

      return super.success(null, {
        genre: genre
      });
    } catch (error) {
      return super.failed(error, "Error occoured while deleting the genre.");
    }
  }
}

module.exports = GenreService;
