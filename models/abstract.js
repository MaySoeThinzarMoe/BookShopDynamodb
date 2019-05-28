const Util = require("../utils/util");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
	region: 'ap-northeast-1',
  endpoint: process.env.IS_LOCAL ? 'http://localhost:8000' : undefined
});

class AbstractModel {

  /**
   * ID generate
   * @param {number} length
   * @return {string}
   */
  static generateId(length = 16) {
    return Util.randomString(length);
  }
  
	/**
	 * @param {Object} queryParams
	 * @return {Array.<Object>}
	 */
	static async queryAll(queryParams) {

		let items = [];
		let lastEvaluatedKey = undefined

		do {
			queryParams.ExclusiveStartKey = lastEvaluatedKey

			const result = await documentClient.query(queryParams).promise().then(res => {
				return res;
			}).catch(error => {
				throw error;
			});

			if (result && result.Items) {
				items = [...items, ...result.Items];
			}

			lastEvaluatedKey = result.LastEvaluatedKey;

		} while (lastEvaluatedKey);

		return items;

	}


  /**
   *
   * @param {CustomError|Error} error
   * @param {string} message
   * @param {number} statusCode
   * @param {Array.<Object>} errors
   * @throws {CustomError} CustomError
   */
  static throwCustomError(error, message, statusCode = 500, errors) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      console.log(error);
      throw new CustomError(message, statusCode, errors);
    }
  }
}

AbstractModel.mainTable = {
	name: `bookshop-${process.env.STAGE}-main`,
  pk: 'PK',
  sk: 'SK'
};

AbstractModel.mainTableGSI5 = {
	name: 'bookshop-main-gsi-5',
  pk: 'genre_id',
  sk: 'SK'
};

AbstractModel.mainTableGSI4 = {
	name: 'bookshop-main-gsi-4',
  pk: 'author_id',
  sk: 'SK'
};

AbstractModel.mainTableGSI3 = {
	name: 'bookshop-main-gsi-3',
  pk: 'email',
  sk: 'SK'
};

AbstractModel.mainTableGSI2 = {
	name: 'bookshop-main-gsi-2',
  pk: 'SK'
};

AbstractModel.mainTableGSI1 = {
	name: 'bookshop-main-gsi-1',
  pk: 'name',
  sk: 'SK'
};

module.exports = AbstractModel;
