"use strict";

const AbstractModel = require('./abstract');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
	region: 'ap-northeast-1',
  endpoint: process.env.IS_LOCAL ? 'http://localhost:8000' : undefined
});

class TokenModel extends AbstractModel{

  /**
   * Get a token string
   * @param {string} tokenString
   * @return {TokenModel|null}
   */
  static async getByTokenString(tokenString) {
    const items = await this._getByTokenString(tokenString);

    return items;
  }

  /**
   * get user with a token string in session_table。
   * @param {string} tokenString
   * @return {Object|null}
   */
  static async _getByTokenString(tokenString) {
    const pk = [this.dataType,tokenString].join('#');
    if (!tokenString) return null;

		const queryParams = {
      TableName: super.mainTable.name,
      IndexName: super.mainTableGSI2.name,
			KeyConditionExpression: '#pk = :pk',
			ExpressionAttributeNames: {
				'#pk': super.mainTableGSI2.pk,
			},
			ExpressionAttributeValues: {
        ':pk': pk,
			}
		};

		const item = await documentClient.query(queryParams).promise().then(res => {
			return res.Items[0] ? res.Items[0] : null;
		}).catch(error => {
			super.throwCustomError(error);
    });

    return item;
  }

  /**
   * delete user with token in session_table
   * @param {string} tokenString
   * @returns {object}
   */
  static async delete(tokenString) {
    const user = await this.getByTokenString(tokenString);    
    const SK = [this.dataType,tokenString].join('#');
    const PK = user.PK;
		const deleteParams = {
      TableName: super.mainTable.name,
      Key: {
        [super.mainTable.pk]: PK,
				[super.mainTable.sk]: SK
			},
			ConditionExpression: `attribute_exists(${super.mainTable.pk}) AND attribute_exists(${super.mainTable.sk})`,
			ReturnValues: 'ALL_OLD'
		};
		const item = await documentClient.delete(deleteParams).promise();

		return item;
  }
}
TokenModel.dataType = 'token';

module.exports = TokenModel;
