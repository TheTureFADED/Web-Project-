(() => {
    const mongodb = require('mongodb')
    const MongoClient = mongodb.MongoClient
    const connection = require("./config/config")
    
    // Singleton MongoDB client
    let mongoClient = null
    
    //-------------------------------------------------------------------------
    /**
     * Connection Strings
     */
    //-------------------------------------------------------------------------
    const getMongoClient = (local = false) => {
        
        if (mongoClient) {
            return mongoClient
        }
        
        let uri = `mongodb+srv://${connection.USERNAME}:${connection.PASSWORD}@${connection.SERVER}/${connection.DATABASE}?retryWrites=true&w=majority&appName=Cluster0`
        if (local) {
            uri = `mongodb://127.0.0.1:27017/${connection.DATABASE}`
        }
        console.log(`Connection String<<${uri}`)
        
        
        mongoClient = new MongoClient(uri)
        return mongoClient
    }
    
    // Connect to MongoDB asynchronously
    const connectToMongoDB = async (local = false) => {
        const client = getMongoClient(local)
        
        try {
            await client.connect()
            console.log('\t|Connected to MongoDB successfully!')
            return client
        } catch (error) {
            console.error('\t|MongoDB connection error:', error)
            throw error
        }
    }
    
    //-------------------------------------------------------------------------
    /**
     * Data Manipulation Language (DML) functions
     * 
     */
    //-------------------------------------------------------------------------
    //find matching documents
    const findAll = async (collection, query) => {
        return collection.find(query).toArray()
            .catch(err => {
                console.log("Could not find ", query, err.message);
            })
    }
    
    const findOne = async (collection, id) => {
        return collection.findOne({_id: new mongodb.ObjectId(id)})
        .catch(err => {
            console.log(`Could not find document with id=${id} `, err.message);
        })
    }
    
    //delete matching documents
    const deleteMany = async (collection, query) => {
        return collection.deleteMany(query)
            .catch(err => {
                console.log("Could not delete many ", query, err.message);
            })
    }
    
    //delete one matching document
    const deleteOne = async (collection, query) => {
        return collection.deleteOne(query)
            .catch(err => {
                console.log("Could not delete one ", query, err.message);
            })
    }
    
    //insert data into our collection
    const insertMany = async (collection, documents) => {
        return collection.insertMany(documents)
            .then(res => console.log("Data inserted with IDs", res.insertedIds))
            .catch(err => {
                console.log("Could not add data ", err.message);
                
                if (!(err.name === 'BulkWriteError' && err.code === 11000)) throw err;
            })
    }
    
    const insertOne = async (collection, document) => {
        return await collection.insertOne(document)
            .then(res => console.log("Data inserted with ID", res.insertedId))
            .catch(err => {
                console.log("Could not add data ", err.message);
                
                if (!(err.name === 'BulkWriteError' && err.code === 11000)) throw err;
            })
    }
    
    //-------------------------------------------------------------------------
    /**
     *  log Request Function 
     */
    //-------------------------------------------------------------------------
    const logRequest = async (req, res, next) => {
        try {
            const client = getMongoClient()
            
            // If client is not connected, connect it
            if (!client.topology || !client.topology.isConnected()) {
                await client.connect()
            }
            
            console.log('\t|inside logRequest()')
            
            let collection = client.db().collection("Requests")
            let log = {
                Timestamp: new Date(),
                Method: req.method,
                Path: req.url,
                Query: req.query,
                'Status Code': res.statusCode,
            }
            
            await insertOne(collection, log)
            
            
            if (next) next()
        } catch (err) {
            console.error(`\t|Could not log request to MongoDB Server\n\t|${err}`)
         
            if (next) next()
        }
    }
    
    // Create the util object with all functions
    const util = {
        url: 'localhost',
        username: 'webuser',
        password: 'letmein',
        port: 22643,
        database: 'forum',
        collections: ['logs', 'posts', 'users', 'roles'],
        getMongoClient,
        connectToMongoDB,
        findAll,
        findOne,
        insertOne,
        insertMany,
        deleteOne,
        deleteMany,
        logRequest
    }
    
    const moduleExport = util
    if (typeof __dirname != 'undefined')
        module.exports = moduleExport
})()