const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;
let _db;
async function connect(url, dbname) {
    let client = await MongoClient.connect(url, {
        useUnifiedTopology:true
    })
    
    // function(err, client){
    //     console.log("server connected");
    //     _db = client.db(dbname);
    // })
    _db = client.db(dbname);
    console.log("connected")
}
function getDB() {
    return _db;
}
module.exports = {
    connect, getDB
}