const Moment = require("moment");
const AbstractModel = require("./abstract");
const UserModel = require("./user");
const BookModel = require("./book");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
	region: 'ap-northeast-1',
  endpoint: process.env.IS_LOCAL ? 'http://localhost:8000' : undefined
});

class AuthorModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.sk = params.sk;
        this.name = params.name;
        this.history = params.history;
        this.description = params.description;
        this.created_user_id = params.created_user_id;
        this.updated_user_id = params.updated_user_id;
        this.deleted_user_id = params.deleted_user_id;
        this.created_at = params.created_at;
        this.updated_at = params.updated_at;
        this.deleted_at = params.deleted_at;
    }

    /**
     * convert to JSON
     */
    toJSON() {
        const clone = { ...this };

        return clone;
    }

    /**
     * create author
     */
    static async create(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.Authorization);
        const id = super.generateId();
        const sk = this.dataType + "#";
        const name = params.name;
        const history = params.history;
        const description = params.description;
        const created_user_id = loginUser.PK;
        const updated_user_id = loginUser.PK;
        const created_at = Moment().format();
        const updated_at = Moment().format();

        const itemParams = {
            PK: id,
            SK: sk,
            name: name,
            history: history,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        await documentClient.put({
			TableName:super.mainTable.name,
			Item: itemParams,
        }).promise();

        return this.toModel(itemParams);
    }

    /**
     * Acquire author with Id
     */
    static async getById(authorId) {
        const item = await this._getById(authorId);

        return item;
    }

    /**
     * Acquire author with Id.
     * @param {string} authorId
     * @return {Object|null}
     */
    static async _getById(authorId) {
        if (!authorId) return null;

		const queryParams = {
			TableName: super.mainTable.name,
			KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
			ExpressionAttributeNames: {
                '#pk': super.mainTable.pk,
                '#sk': super.mainTable.sk
			},
			ExpressionAttributeValues: {
                ':pk': authorId,
                ':sk': `${this.dataType}#`
			}
        };
    
        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error,"Error");
        });

        return item;
    }

    /**
     * Acquire author with Name
     */
    static async getByName(params) {
        const item = await this._getByName(params);

        return item;
    }

    /**
     * Acquire author with Name.
     * @param {string} authorName
     * @return {Object|null}
     */
    static async _getByName(authorName) {
        const queryParams = {
			TableName: super.mainTable.name,
			IndexName: super.mainTableGSI1.name,
			KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
			ExpressionAttributeNames: {
                '#pk': super.mainTableGSI1.pk,
                '#sk': super.mainTableGSI1.sk
			},
			ExpressionAttributeValues: {
                ':pk': authorName,
                ':sk': `${this.dataType}#`
			}
		};
        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error);
        });

        return item;
    }

    /**
     * get all authors
     * @return {Array.<Object>}
     */
    static async getAll(userId) {
        const item = await AuthorModel._getAll(userId);
        const items = item.map(model => {

            return this.toModel(model);
        });

        return items;
    }

    /**
     * get all authors
     */
    static async _getAll(userId) {
        if (!userId) return null;

		const queryParams = {
			TableName: super.mainTable.name,
			IndexName: super.mainTableGSI2.name,
			KeyConditionExpression: '#pk = :pk',
			ExpressionAttributeNames: {
				'#pk': super.mainTableGSI2.pk
			},
			ExpressionAttributeValues: {
				':pk': `${this.dataType}#`
			}
		};

		const items = await super.queryAll(queryParams);

        return items;
    }

    /**
     * update author
     * @param {Object}
     * @return {Object}
     */
    static async update(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.token);
        const author = await this.getById(params.authorId);
        const authorData = author.Items[0];

        const id = params.authorId;
        const SK = this.dataType + '#';
        const name = params.name;
        const history = params.history;
        const description = params.description;
        const created_user_id = authorData.created_user_id;
        const updated_user_id = loginUser.PK;
        const created_at = authorData.created_at;
        const updated_at = Moment().format();

        const itemParams = {
            id: id,
            SK: SK,
            name: name,
            history: history,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }

		const updateParams = {
			TableName: super.mainTable.name,
			Key: {
				PK: id,
				SK: SK
			},
			UpdateExpression: 'set ' +
				'#name = :name, ' +
				'#history = :history ,' +
				'#description = :description, ' +
				'#updated_user_id = :updated_user_id ,' +
				'#updated_at = :updated_at ' ,
			ExpressionAttributeNames: {
				'#name': 'name',
				'#history': 'history',
				'#description': 'description',
				'#updated_user_id': 'updated_user_id',
				'#updated_at': 'updated_at'
			},
			ExpressionAttributeValues: {
				':name': name,
				':history': history,
				':description': description,
				':updated_user_id': updated_user_id,
				':updated_at': updated_at
			},
			ConditionExpression: `attribute_exists(${super.mainTable.pk}) AND attribute_exists(${super.mainTable.sk})`,
			ReturnValues: 'ALL_NEW'
		};
		await documentClient.update(updateParams).promise();

        return this.toModel(itemParams);
    }

    /**
     *delete author
     * @return {AuthorModel}
     */
    static async delete(authorId) {
        const bookByAuthorId = await BookModel.getByAuthorId(authorId);        
        const SK = this.dataType + "#";
        const PK = authorId;
        var itemsArray = [];
        var item1 = {
            DeleteRequest: {
                Key: {
                    [ super.mainTable.pk ]: PK,
                    [ super.mainTable.sk ]: SK
                }
            }
        };
        itemsArray.push(item1);

        bookByAuthorId.forEach(book => {
            var item2 = {
                DeleteRequest: {
                    Key: {
                        [ super.mainTable.pk ]: book.PK,
                        [ super.mainTable.sk ]: book.SK
                    }
                }
            };
            itemsArray.push(item2);
        });

        var params = {
            RequestItems: {
                [super.mainTable.name]: itemsArray
            }
        };

        var item = documentClient.batchWrite(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        });

        return new AuthorModel(item);
    }

    /**
     *  Create instances
     * @param {Object} item
     * @return {AuthorModel|null}
     */
    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.PK !== undefined ? item.PK : null,
            sk: item.SK !== undefined ? item.SK : null,
            name: item.name !== undefined ? item.name : null,
            history: item.history !== undefined ? item.history : null,
            description: item.description !== undefined ? item.description : null,
            created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
            updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
            deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };

        return new AuthorModel(params);
    }
}

AuthorModel.dataType = 'author';

module.exports = AuthorModel;




    // /**
    //  *delete author
    //  * @return {AuthorModel}
    //  */
    // static async delete(authorId) {
    //     const bookByAuthorId = await BookModel.getByAuthorId(authorId);
    //     const SK = this.dataType + "#";
    //     const PK = authorId;
	// 	const deleteParams = {
    //     TableName: super.mainTable.name,
    //     Key: {
    //             [super.mainTable.pk]: PK,
    //             [super.mainTable.sk]: SK
    //         },
    //         ConditionExpression: `attribute_exists(${super.mainTable.pk}) AND attribute_exists(${super.mainTable.sk})`,
    //         ReturnValues: 'ALL_OLD'
    //     };
    //     const item = await documentClient.delete(deleteParams).promise();

    //     bookByAuthorId.forEach(book => {
    //         BookModel.delete(book.PK);
    //     });
        
    //     return new AuthorModel(item);
    // }
