"use strict";

const AbstractService = require("./service/abstract");
const UserService = require('./service/user');
const AdminService = require('./service/admin');
const AuthorService = require('./service/author');
const GenreService = require('./service/genre');
const BookService = require('./service/book');
const CustomErrors = require("./utils/customErrors");
const CustomError = CustomErrors.CustomError;

/**
 * Filter without authentication
 * @param {Object} params
 * @return {Object}
 */
const NoAuth = async params => {
  return params;
};

const User = async params =>  {
  const authedUser = await UserService.authenticate(params);
  params.currentUser = authedUser;

  return params;
};

const AdminOnly = async params =>  {
  const authedUser = await AdminService.authenticate(params);
  params.currentUser = authedUser;
  
  return params;
};

const router = {
  /**
   * user
   */
  '/user/signup': {
    POST: {
      auth: NoAuth,
      main: UserService.signup
    }
  },
  '/user/login': {
    POST: {
      auth: NoAuth,
      main: UserService.login
    }
  },
  '/user/logout': {
    POST: {
      auth: User,
      main: UserService.logout
    }
  },
  '/user/{userId}': {
    GET: {
      auth: AdminOnly,
      main: UserService.userById
    }
  },
  
  /**
   * author
   */
  "/author": {
    POST: {
      auth: AdminOnly,
      main: AuthorService.register
    },
    GET: {
      auth: AdminOnly,
      main: AuthorService.getAuthors
    },
  },
  '/author/{authorId}': {
    GET: {
      auth: AdminOnly,
      main: AuthorService.getAuthor
    },
    PUT: {
      auth: AdminOnly,
      main: AuthorService.updateAuthor
    },
    DELETE: {
      auth: AdminOnly,
      main: AuthorService.deleteAuthor
    }
  },
  '/authorByName': {
    POST: {
      auth: AdminOnly,
      main: AuthorService.getAuthorByName
    }
  },
  /**
   * genre
   */
  "/genre": {
    POST: {
      auth: AdminOnly,
      main: GenreService.register
    },
    GET: {
      auth: AdminOnly,
      main: GenreService.getGenres
    }
  },
  '/genre/{genreId}': {
    GET: {
      auth: AdminOnly,
      main: GenreService.getGenre
    },
    PUT: {
      auth: AdminOnly,
      main: GenreService.updateGenre
    },
    DELETE: {
      auth: AdminOnly,
      main: GenreService.deleteGenre
    }
  },
  '/genreByName': {
    POST: {
      auth: AdminOnly,
      main: GenreService.getGenreByName
    }
  },
  /**
   * book
   */
  "/book": {
    POST: {
      auth: AdminOnly,
      main: BookService.register
    },
    GET: {
      auth: User,
      main: BookService.getBooks
    }
  },
  '/book/{bookId}': {
    GET: {
      auth: User,
      main: BookService.getBook
    },
    PUT: {
      auth: AdminOnly,
      main: BookService.updateBook
    },
    DELETE: {
      auth: AdminOnly,
      main: BookService.deleteBook
    }
  },
  '/bookByName': {
    POST: {
      auth: User,
      main: BookService.getBookByName
    }
  },
};

/************************************
 *Main Procressing
 ************************************/
module.exports.callHandler = async (event, context, callback) => {

  // Determine the handler to call from Url format and HTTP method.
  let handler = null;
  handler = router[event.resource][event.httpMethod];
  const params = getEventParams(event);

  // Authentication processing
  const authedParams = await handler.auth(params);

  // Main processing
  let serviceResponse;
  try {
    serviceResponse = await handler.main(authedParams);

  } catch (error) {
    console.log("errorrrrrrrrr", handler.main(authedParams));

    return handleError(error, "Cannot carry post data");
  }

  return apiGatewayResponse(null, serviceResponse);
};

/**
 *Extract and return the parameters necessary for handler handling from event
 * @param {Object} event
 * @return {Object}
 */
const getEventParams = event => {
  let params = {
    headers: event.headers,
    path: event.pathParameters,
    query: event.queryStringParameters,
    body: event.body ? JSON.parse(event.body) : event.body
  };

  return params;
};

/**
 *Create a response object to be passed to API Gateway。
 * @param {number} statusCode
 * @param {Object} serviceResponse
 * @return {Object}
 */
const apiGatewayResponse = (statusCode, serviceResponse) => {
  
  //header
	let headers = {
		'Access-Control-Allow-Origin': '*', // Required for CORS support to work
		'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
	};
	if (serviceResponse) {
		if (serviceResponse.headers && typeof serviceResponse.headers === 'object') {
			headers = { ...headers, ...serviceResponse.headers };
		}
	}

  //body 
	const body = serviceResponse && serviceResponse.body ? serviceResponse.body : undefined;
  
  //statusCode
	if (!statusCode) {
		if (body && body.statusCode) {
			statusCode = body.statusCode;
		} else {
			statusCode = body ? 200 : 204;
		}
	}

	let response;
	let responseLog;
	if (
		headers['Content-Type'] === 'application/octet-stream' ||
		headers['content-type'] === 'application/octet-stream'
	) {

		response = {
			statusCode: statusCode,
			headers: headers,
			body: body,
			isBase64Encoded: true
		};

		responseLog = {...response};
		responseLog.body = '[BASE_64_STRING]';

	} else {

		response = {
			statusCode: statusCode,
			headers: headers,
			body: JSON.stringify(body)
		};

		responseLog = {...response};

	}

	console.log('-----> RESPONSE');
	console.log(responseLog);
	console.log('<-----');

	return response;
};

/**
 * handleError
 * @param {Error|CustomError}
 * @param {string} message
 * @param {number} statusCode
 * @param {Array.<Object>} errors
 * @param {Object} headers
 * @return {Object}
 */
const handleError = (error, message, statusCode, errors, headers) => {
  const response = AbstractService.failed(
    error,
    message,
    statusCode,
    errors,
    headers
  );

  return apiGatewayResponse(null, response);
};
