const Moment = require("moment");
const AbstractModel = require("./abstract");
const UserModel = require("./user");
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    region: 'ap-northeast-1',
    endpoint: process.env.IS_LOCAL ? 'http://localhost:8000' : undefined
});

class BookModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.sk = params.sk;
        this.name = params.name;
        this.price = params.price;
        this.author_id = params.author_id;
        this.genre_id = params.genre_id;
        this.image = params.image;
        this.sample_pdf = params.sample_pdf;
        this.published_date = params.published_date;
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
     * create book
     */
    static async create(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.Authorization);

        const id = super.generateId();
        const sk = this.dataType + "#";
        const name = params.name;
        const price = params.price;
        const author_id = params.author_id;
        const genre_id = params.genre_id;
        const published_date = params.published_date;
        const description = params.description;
        const created_user_id = loginUser.PK;
        const updated_user_id = loginUser.PK;
        const created_at = Moment().format();
        const updated_at = Moment().format();
        const image = params.image;
        const sample_pdf = params.sample_pdf;

        const itemParams = {
            PK: id,
            SK: sk,
            name: name,
            price: price,
            author_id: author_id,
            genre_id: genre_id,
            image: image,
            sample_pdf: sample_pdf,
            published_date: published_date,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }

        await documentClient.put({
            TableName: super.mainTable.name,
            Item: itemParams,
        }).promise();

        return this.toModel(itemParams);
    }

    /**
     * Get book with ID.
     */
    static async getById(bookId) {
        const item = await this._getById(bookId);

        return item;
    }

    /**
     * Acquire book with ID.
     * @param {string} bookId
     * @return {Object|null}
     */
    static async _getById(bookId) {
        if (!bookId) return null;

        const queryParams = {
            TableName: super.mainTable.name,
            KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
            ExpressionAttributeNames: {
                '#pk': super.mainTable.pk,
                '#sk': super.mainTable.sk
            },
            ExpressionAttributeValues: {
                ':pk': bookId,
                ':sk': `${this.dataType}#`
            }
        };

        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error, "Error");
        });

        return item.Items[0];
    }

    /**
     * Get book with Author ID.
     */
    static async getByAuthorId(authorId) {
        const item = await this._getByAuthorId(authorId);

        return item;
    }

    /**
     * Acquire book with author ID.
     * @param {string} authorId
     * @return {Object|null}
     */
    static async _getByAuthorId(authorId) {
        if (!authorId) return null;

        const queryParams = {
            TableName: super.mainTable.name,
            IndexName: super.mainTableGSI4.name,
            KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
            ExpressionAttributeNames: {
                '#pk': super.mainTableGSI4.pk,
                '#sk': super.mainTableGSI4.sk
            },
            ExpressionAttributeValues: {
                ':pk': authorId,
                ':sk': `${this.dataType}#`
            }
        };

        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error, "Error");
        });

        return item.Items;
    }

    /**
     * Get book with Genre ID.
     */
    static async getByGenreId(genreId) {
        const item = await this._getByGenreId(genreId);

        return item;
    }

    /**
     * Acquire book with ID.
     * @param {string} genreId
     * @return {Object|null}
     */
    static async _getByGenreId(genreId) {
        if (!genreId) return null;

        const queryParams = {
            TableName: super.mainTable.name,
            IndexName: super.mainTableGSI5.name,
            KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
            ExpressionAttributeNames: {
                '#pk': super.mainTableGSI5.pk,
                '#sk': super.mainTableGSI5.sk
            },
            ExpressionAttributeValues: {
                ':pk': genreId,
                ':sk': `${this.dataType}#`
            }
        };

        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error, "Error");
        });

        return item.Items;
    }

    /**
     * Acquire book with Name
     */
    static async getByName(params) {
        const item = await this._getByName(params);

        return item;
    }

    /**
     * Acquire book with Name.
     * @param {string} bookName
     * @return {Object|null}
     */
    static async _getByName(bookName) {
        const queryParams = {
            TableName: super.mainTable.name,
            IndexName: super.mainTableGSI1.name,
            KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
            ExpressionAttributeNames: {
                '#pk': super.mainTableGSI1.pk,
                '#sk': super.mainTableGSI1.sk
            },
            ExpressionAttributeValues: {
                ':pk': bookName,
                ':sk': `${this.dataType}#`
            }
        };
        const item = await documentClient.query(queryParams).promise().catch(error => {
            super.throwCustomError(error);
        });

        return item.Items[0];
    }

    /**
     * get all books
     * @return {Array.<Object>}
     */
    static async getAll() {
        const item = await BookModel._getAll();
        const items = item.map(model => {

            return this.toModel(model);
        });

        return items;
    }

    /**
     * get all books
     */
    static async _getAll() {
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
     * update book
     * @param {Object}
     * @return {Object}
     */
    static async update(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.token);
        const book = await this.getById(params.bookId);

        const id = params.bookId;
        const SK = this.dataType + '#';
        const name = params.name;
        const price = params.price;
        const author_id = params.author_id;
        const genre_id = params.genre_id;
        const published_date = params.published_date;
        const description = params.description;
        const created_user_id = book.created_user_id;
        const updated_user_id = loginUser.PK;
        const created_at = loginUser.PK;
        const updated_at = Moment().format();
        const image = params.image;
        const sample_pdf = params.sample_pdf;

        const itemParams = {
            PK: id,
            SK: SK,
            name: name,
            price: price,
            author_id: author_id,
            genre_id: genre_id,
            image: image,
            sample_pdf: sample_pdf,
            published_date: published_date,
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
                '#price = :price ,' +
                '#author_id = :author_id, ' +
                '#genre_id = :genre_id ,' +
                '#image = :image, ' +
                '#sample_pdf = :sample_pdf, ' +
                '#published_date = :published_date, ' +
                '#description = :description ',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#price': 'price',
                '#author_id': 'author_id',
                '#genre_id': 'genre_id',
                '#image': 'image',
                '#sample_pdf': 'sample_pdf',
                '#published_date': 'published_date',
                '#description': 'description',
            },
            ExpressionAttributeValues: {
                ':name': name,
                ':price': price,
                ':author_id': author_id,
                ':genre_id': genre_id,
                ':image': image,
                ':sample_pdf': sample_pdf,
                ':published_date': published_date,
                ':description': description,
            },
            ConditionExpression: `attribute_exists(${super.mainTable.pk}) AND attribute_exists(${super.mainTable.sk})`,
            ReturnValues: 'ALL_NEW'
        };
        await documentClient.update(updateParams).promise();

        return this.toModel(itemParams);
    }

    /**
     *delete book
     * @return {BookModel}
     */
    static async delete(bookId) {
        const SK = this.dataType + '#';
        const PK = bookId;
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

        return new BookModel(item);
    }

    /**
     *  Create instances 
     * @param {Object} item
     * @return {BookModel|null}
     */
    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.PK !== undefined ? item.PK : null,
            sk: item.SK !== undefined ? item.SK : null,
            name: item.name !== undefined ? item.name : null,
            price: item.price !== undefined ? item.price : null,
            author_id: item.author_id !== undefined ? item.author_id : null,
            genre_id: item.genre_id !== undefined ? item.genre_id : null,
            image: item.image !== undefined ? item.image : null,
            sample_pdf: item.sample_pdf !== undefined ? item.sample_pdf : null,
            published_date: item.published_date !== undefined ? item.published_date : null,
            history: item.history !== undefined ? item.history : null,
            description: item.description !== undefined ? item.description : null,
            created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
            updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
            deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };

        return new BookModel(params);
    }
}
BookModel.dataType = 'book';

module.exports = BookModel;