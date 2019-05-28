const Moment = require("moment");
const AbstractModel = require("./abstract");
const UserModel = require("./user");
const BookModel = require("./book");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
	region: 'ap-northeast-1',
  endpoint: process.env.IS_LOCAL ? 'http://localhost:8000' : undefined
});

class GenreModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.sk = params.sk;
        this.name = params.name;
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
     * create genre
     */
    static async create(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.Authorization);
        const id = super.generateId();
        const sk = this.dataType + '#';
        const name = params.name;
        const description = params.description;
        const created_user_id = loginUser.PK;
        const updated_user_id = loginUser.PK;
        const created_at = Moment().format();
        const updated_at = Moment().format();

        const itemParams = {
            PK: id,
            SK: sk,
            name: name,
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
     * Acquire one genre with Name
     */
    static async getById(genreId) {
        const item = await this._getById(genreId);

        return item;
    }

    /**
     * Acquire genre with name.
     * @param {string} genreId
     * @return {Object|null}
     */
    static async _getById(genreId) {
        if (!genreId) return null;

		const queryParams = {
			TableName: super.mainTable.name,
			KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
			ExpressionAttributeNames: {
                '#pk': super.mainTable.pk,
                '#sk': super.mainTable.sk
			},
			ExpressionAttributeValues: {
                ':pk': genreId,
                ':sk': `${this.dataType}#`
			}
        };
    
        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error,"Error");
        });

        return item;
    }

    /**
     * Acquire genre with Name
     */
    static async getByName(params) {
        const item = await this._getByName(params);
    
        return item;
    }

    /**
     * Acquire genre with Name.
     * @param {string} genreName
     * @return {Object|null}
     */
    static async _getByName(genreName) {
        const queryParams = {
			TableName: super.mainTable.name,
			IndexName: super.mainTableGSI1.name,
			KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
			ExpressionAttributeNames: {
                '#pk': super.mainTableGSI1.pk,
                '#sk': super.mainTableGSI1.sk
			},
			ExpressionAttributeValues: {
                ':pk': genreName,
                ':sk': `${this.dataType}#`
			}
		};
        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error);
        });

        return item;
    }

    /**
     * get all genres
     * @return {Array.<Object>}
     */
    static async getAll() {
        const item = await GenreModel._getAll();
        const items = item.map(model => {

            return this.toModel(model);
        });

        return items;
    }

    /**
     * get all genre
     */
    static async _getAll() {
		const SK = this.dataType + '#';
        
		const queryParams = {
			TableName: super.mainTable.name,
			IndexName: super.mainTableGSI2.name,
			KeyConditionExpression: '#pk = :pk',
			ExpressionAttributeNames: {
				'#pk': super.mainTableGSI2.pk
			},
			ExpressionAttributeValues: {
				':pk': SK
			}
		};

		const items = await super.queryAll(queryParams);

        return items;
    }

    /**
     * update genre
     * @param {Object}
     * @return {Object}
     */
    static async update(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.token);
        const genre = await this.getById(params.genreId);
        const genreData = genre.Items[0];
        const id = params.genreId;
        const SK = this.dataType + '#';
        const name = params.name;
        const description = params.description;
        const created_user_id = genreData.created_user_id;
        const updated_user_id = loginUser.PK;
        const created_at = genreData.created_at;
        const updated_at = Moment().format();

        const itemParams = {
            id: id,
            SK: SK,
            name: name,
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
				'#description = :description, ' +
				'#updated_user_id = :updated_user_id ,' +
				'#updated_at = :updated_at ' ,
			ExpressionAttributeNames: {
				'#name': 'name',
				'#description': 'description',
				'#updated_user_id': 'updated_user_id',
				'#updated_at': 'updated_at'
			},
			ExpressionAttributeValues: {
				':name': name,
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
     *delete genre
     * @return {GenreModel}
     */
    static async delete( genreId ) {
        const bookByGenreId = await BookModel.getByGenreId(genreId);
        const SK = this.dataType + '#';
        const PK = genreId;
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

        bookByGenreId.forEach(book => {
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

        return new GenreModel(item);
    }

    /**
     *  Create instances
     * @param {Object} item
     * @return {GenreModel|null}
     */
    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.PK !== undefined ? item.PK : null,
            sk: item.SK !== undefined ? item.SK : null,
            name: item.name !== undefined ? item.name : null,
            description: item.description !== undefined ? item.description : null,
            created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
            updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
            deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };

        return new GenreModel(params);
    }
}
GenreModel.dataType = 'genre';

module.exports = GenreModel;




   // /**
    //  *delete genre
    //  * @return {GenreModel}
    //  */
    // static async delete( genreId ) {
    //     const bookByGenreId = await BookModel.getByGenreId(genreId);
    //     const SK = this.dataType + '#';
    //     const PK = genreId;
	// 	const deleteParams = {
    //     TableName: super.mainTable.name,
    //         Key: {
    //             [super.mainTable.pk]: PK,
    //             [super.mainTable.sk]: SK
    //         },
    //         ConditionExpression: `attribute_exists(${super.mainTable.pk}) AND attribute_exists(${super.mainTable.sk})`,
    //         ReturnValues: 'ALL_OLD'
    //     };
    //     const item = await documentClient.delete(deleteParams).promise();
    //     bookByGenreId.forEach(book => {
    //         BookModel.delete(book.PK);
    //     });

    //     return new GenreModel(item);
    // }
