// setup express app start

const express = require("express");
const cors = require("cors");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const mongoURL = process.env.MONGO_URL

// setup express
let app = express();

// enable processing json
app.use(express.json());

//enable cors
app.use(cors())


async function main() {

    // add routes
    app.get('/', function (req, res) {
        res.send("<h1>Workout Tracker Home</h1>")
    })

    // app.get('/list', async function (req, res) {
    //     db = MongoUtil.getDB();
    //     let equipment = await db.collection("equipment").find().toArray()
    //     let muscle = await db.collection("muscle").find().toArray()
    //     let data = {
    //         equipment: equipment,
    //         muscle: muscle
    //     }
    //     res.send(data)
    // })

    // testing to get collections
    app.get('/list/musclegroup', async function (req, res) {
        db = MongoUtil.getDB();
        res.send(await db.collection("muscle_group").find().toArray())
    })

    app.get('/list/equipment', async function (req, res) {
        db = MongoUtil.getDB();
        res.send(await db.collection("equipment").find().toArray())
    })

    app.get('/list/workoutfocus', async function (req, res) {
        db = MongoUtil.getDB();
        res.send(await db.collection("workout_focus").find().toArray())
    })

    app.get('/list/singleexercise', async function (req, res) {
        db = MongoUtil.getDB();
        res.send(await db.collection("single_exercise").find().toArray())
    })



    // All Workout - Get

    app.get('/workouts/browse', async (req, res) => {


        try {
            let db = MongoUtil.getDB();
            let workout_entry = await db.collection("workout_entry").find().toArray();
            res.status(200)
            res.send(workout_entry)

        } catch (e) {
            res.status(500)
            res.send({
                "Message": "Unable to get workouts"
            })
        }
    })

    // One Workout by ID - Get

    app.get('/workouts/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("workout_entry").findOne({
                '_id': ObjectId(req.params.id)
            });
            res.status(200)
            res.send(result)
        } catch (e) {
            rres.status(500)
            res.send({
                "Message": "Unable to get workouts"
            })
        }

    })


    // Workout Entry - Post

    app.post('/workouts/create', async (req, res) => {

        let {
            name,
            focus,
            difficulty,
            intensity,
            duration,
            single_exercise,
            muscle_group
        } = req.body;

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("workout_entry").insertOne({
                name,
                focus,
                difficulty,
                intensity,
                duration,
                single_exercise,
                muscle_group
            })
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Server Error")
            res.status(500);
            console.log(e)
        }
    })

    // Workout Entry by ID - Put

    app.put("/workouts/edit/:id", async (req, res) => {

        let {
            name,
            date
            focus,
            difficulty,
            intensity,
            duration,
            single_exercise,
            muscle_group
        } = req.body;

        try {
            let db = MongoUtil.getDB()
            await db.collection("workout_entry").updateOne({
                "_id": ObjectId(req.params.id)
            }, {
                '$set': {

                    name,
                    date: new Date(),
                    focus,
                    difficulty,
                    intensity,
                    duration,
                    single_exercise,
                    muscle_group
                }
            });
            res.status(200);
            res.send({
                'Message': 'Workout updated'
            })
        } catch (e) {
            res.status(500);
            res.send({
                'Message': "Unable to update workout"
            })
            console.log(e);
        }
    });

    // All Comments for one workout- Get

    app.get('/workouts/:id/comments', async (req, res) => {
        
        try {
            let db = MongoUtil.getDB();
            let results = await db.collection("workout_entry").find({
                "_id":  ObjectId(req.params.id)
            }).project({
                'comment':1
            }).sort({
                comment_date: -1
            }).toArray()
            
            res.status(200)
            res.send(results)

        } catch (e) {
            res.status(500)
            res.send({
                "Message": "Unable to get comments"
            })
        }
    })

    // Comments - Post

    app.post('/workouts/:id/create/comments', async (req, res) => {
        try {
            let db = MongoUtil.getDB()
            let {
                comment_name,
                comment_text
            } = req.body

            let results = await db.collection('workout_entry').updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$push': {
                    'reviews': {
                        id: new ObjectId(),
                        comment_date: new Date(),
                        comment_name,
                        comment_text
                    }
                }
            })

            res.status(200)
            res.send(results)

        } catch (e) {
            res.status(500)
            res.send('Unexpected internal server error')
            console.log(e)
        }
    })




}

main()

// start server
app.listen(3000, () => {
    console.log("Server has started")
})