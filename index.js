// setup express app start

const express = require("express");
const cors = require("cors");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil= require('./MongoUtil');
const mongoURL = process.env.MONGO_URL

// setup express
let app = express();

// enable processing json
app.use(express.json());

//enable cors
app.use(cors())


async function main() {

    //connect to mongodb
    let db = await MongoUtil.connect(mongoURL, 'workout')

    // add routes
    app.get('/', function (req, res){
        res.send("<h1>Hello from Workout Express</h1>")
    })

    app.get('/create', async function(req, res){
        db = MongoUtil.getDB();
        res.send(await db.collection("muscle").find().toArray())
    })

    

    
}

main()

// start server
app.listen(3000, () => {
    console.log("Server has started")
})