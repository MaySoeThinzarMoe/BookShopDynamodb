"use strict";

const Crypto = require("crypto");
const Moment = require("moment");
const AbstractModel = require('./abstract');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
	region: 'ap-northeast-1',
  endpoint: process.env.IS_LOCAL ? 'http://localhost:8000' : undefined
});

class UserModel extends AbstractModel {
  
  constructor(params = {}) {
    super();
    this.id = params.id;
    this.sk = params.sk;
    this.name = params.name;
    this.email = params.email;
    this.password = params.password;
    this.type = params.type;
    this.phone = params.phone;
    this.dob = params.dob;
    this.profile = params.profile;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  /**
   * Save logined user in session table
   * @param {Integer} id
   * @param {String} email
   * @param {String} token
   */
  static async saveLoginedId(id, email, token) {
    const sk = ["token",token].join('#');
    const itemParams = {
      PK: id,
      SK: sk,
      email: email,
      token: token
    }
    await documentClient.put({
			TableName:super.mainTable.name,
			Item: itemParams,
    }).promise().catch(error => {
      console.log(error);
    });
  }

  /**
   * get logined user in session table
   * @param {integer} logined_id
   * @returns {Object}
   */
  static async getLoginedId(logined_id) {
    if (!logined_id) return null;

		const queryParams = {
			TableName: super.mainTable.name,
			KeyConditionExpression: '#pk = :pk ',
			ExpressionAttributeNames: {
				'#pk': super.mainTable.pk,
			},
			ExpressionAttributeValues: {
				':pk': logined_id,
			}
    };
    
    const item = await documentClient.query(queryParams).promise().then(res => {
			return res.Items[0] ? res.Items[0] : null;
		}).catch(error => {
			super.throwCustomError(error,"Error");
		});

    return item;
  }
  
  /**
	 * get logined user in session table
	 * @param {string} userId 
	 * @return {Object|null}
	 */
	static async getAdminDetailById(userId) {
    if (!userId) return null;

		const queryParams = {
			TableName: super.mainTable.name,
			KeyConditionExpression: '#pk = :pk ',
			ExpressionAttributeNames: {
				'#pk': super.mainTable.pk,
			},
			ExpressionAttributeValues: {
				':pk': userId,
			}
    };
    
    const item = await documentClient.query(queryParams).promise().then(res => {
			return res.Items[0] ? res.Items[0] : null;
		}).catch(error => {
			super.throwCustomError(error,"Error");
		});

    return item;
  }

  /**
	 * get user by token in session table
	 * @param {string} tokenString 
	 * @return {Object}
	 */
  static async getUserIdByToken(tokenString) {
    const pk = ["token",tokenString].join('#');
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
   * user create
   * @param {Object} params
   * @return {UserModel}
   */
  static async create(params) {
    const userAll = await this.getAllUser();
    //const userCount = await this.getUserIdByToken();
    
    const id =super.generateId();
    const sk = this.dataType + "#";
    const name = params.name;
    const email = params.email;
    const password = this.hashPassword(params.password);
    const type = userAll.length == 0 ? this.type.admin : this.type.user;
    const phone = params.phone;
    const dob = params.dob;
    const created_at = Moment().format();
    const updated_at = Moment().format();
    const profile = params.profile;
    
    const itemParams = {
      PK: id,
      SK: sk,
      name: name,
      email: email,
      password: password,
      type: type, 
      phone: phone,
      dob: dob,
      profile: profile,
      created_at: created_at,
      updated_at: updated_at,
    };

    await documentClient.put({
			TableName:super.mainTable.name,
			Item: itemParams,
    }).promise().catch(error => {
      console.log(error);
		});
    
    return this.toModel(itemParams);
  }
 
  /**
    *get one user by email address。
    * @param {string} email
    * @return {Object|null}
    */
  static async getByEmail(email) {
		const queryParams = {
			TableName: super.mainTable.name,
			IndexName: super.mainTableGSI3.name,
			KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
			ExpressionAttributeNames: {
        '#pk': super.mainTableGSI3.pk,
        '#sk': super.mainTableGSI3.sk
			},
			ExpressionAttributeValues: {
        ':pk': email,
        ':sk': `${this.dataType}#`
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
    *get one user by id
    * @param {string} email
    * @return {Object|null}
    */
  static async getById(id) {
    if (!id) return null;

		const queryParams = {
			TableName: super.mainTable.name,
			KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
			ExpressionAttributeNames: {
        '#pk': super.mainTable.pk,
        '#sk': super.mainTable.sk
			},
			ExpressionAttributeValues: {
        ':pk': id,
        ':sk': `${this.dataType}#`
			}
    };
    
    const item = await documentClient.query(queryParams).promise().then(res => {
			return res.Items[0] ? res.Items[0] : null;
		}).catch(error => {
			super.throwCustomError(error,"Error");
		});

    return item;
  }

  /**
   *Acquire one user with login information。
   * @param {string} email
   * @param {password} password
   * @return {UserModel}
   */
  static async getByLogin(email, password) {
    const item = await this._getByLogin(email, password);
    
    return item;
  }

  /**
   * Acquire one user with login information。
   * @param {string} email
   * @param {password} password
   * @return {Object}
   */
  static async _getByLogin(email, password) {
    const passwordHash = this.hashPassword(password);
    const item = await this.getByEmail(email);
    if ( item.password !== passwordHash ) {

      return null;
    }
    
    return item;
  }

  /**
   * Acquire all user
   * @return {Object}
   */
  static async getAllUser() {
    const queryParams = {
      TableName: super.mainTable.name,
      IndexName: super.mainTableGSI2.name,
			KeyConditionExpression: '#pk= :pk',
			ExpressionAttributeNames: {
				'#pk': super.mainTableGSI2.pk,
			},
			ExpressionAttributeValues: {
				':pk': `${this.dataType}#`,
			}
    };
    
    const items = await super.queryAll(queryParams);

    return items;
  }

  /**
   * HashedPassword
   * @param {number} password
   * @return {string} hashedPassword
   */
  static hashPassword(password) {
    let passwordHash = process.env.SALT_KEY + password;
    for (var i = 0; i < 3; i++) {
      passwordHash = Crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
    }

    return passwordHash;
  }

  /**
   * Create instance
   * @param {Object} item
   * @return {UserModel|null}
   */
  static toModel(item) {
    if (!item) return null;
    const params = {
      id: item.PK !== undefined ? item.PK : null,
      sk: item.SK !== undefined ? item.SK : null,
      name: item.name !== undefined ? item.name : null,
      email: item.email !== undefined ? item.email : null,
      password: item.password !== undefined ? item.password : null,
      type: item.type !== undefined ? item.type : null,
      phone: item.phone !== undefined ? item.phone : null,
      dob: item.dob !== undefined ? item.dob : null,
      profile: item.profile !== undefined ? item.profile : null,
      created_at: item.created_at !== undefined ? item.created_at : null,
      updated_at: item.updated_at !== undefined ? item.updated_at : null,
      deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
    };
    
    return new UserModel(params);
  }
}

UserModel.dataType = 'user';

/**
 * Define user types
 */
UserModel.type = {
  admin: "0",
  user: "1"
};


module.exports = UserModel;
