const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
let _db;

async function connect(url, dbName) {

    // create a client
    let client = await MongoClient.connect(url, {
        useUnifiedTopology:true
    })
    
    // use a database
    _db = client.db(dbName);
    console.log("connected");   
}

function getDB() {
    return _db;
}

// exporting out the connect function
module.exports = {
    connect, getDB
}

