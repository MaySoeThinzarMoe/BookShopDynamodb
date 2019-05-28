const UserModel = require("./user");
const AuthorModel = require("./author");
const GenreModel = require("./genre");
const BookModel = require("./book");

module.exports = {
  User: UserModel,
  Author: AuthorModel,
  Genre: GenreModel,
  Book: BookModel,
};
