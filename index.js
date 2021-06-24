// setup express app start

const express = require("express");
const cors = require("cors");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const {
    ObjectID
} = require("bson");
const mongoURL = process.env.MONGO_URL;


// setup express
let app = express();

// enable processing json
app.use(express.json());

//enable cors
app.use(cors())


async function main() {
    await MongoUtil.connect(mongoURL, 'workout');

    // add routes
    app.get('/', function (req, res) {
        res.send("<h1>Connection Success Workout Tracker Home</h1>")
    })

    // Get different collections to show on forms

    app.get('/list/musclegroup', async function (req, res) {
        let db = MongoUtil.getDB();
        res.send(await db.collection("muscle_group").find().toArray())
    })

    app.get('/list/equipment', async function (req, res) {
        let db = MongoUtil.getDB();
        res.send(await db.collection("equipment").find().toArray())
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
            
            res.statusCode = 200
            res.send(workout_entry)
        } catch (e) {
            res.statusCode = 500
            res.send({
                "Message": "Unable to get workouts"
            })
        }
    })

    // New Workout Entry - Post

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

        for (let i = 0; i < single_exercise.length; i++) {
            single_exercise[i].id = new ObjectId(single_exercise[i].id)
        }

        for (let i = 0; i < muscle_group.length; i++) {
            muscle_group[i]._id = new ObjectId(muscle_group[i]._id)
        }

        if (focus == null) {
            focus = []
        }

        if (muscle_group == null) {
            muscle_group = []
        }

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("workout_entry").insertOne({
                name,
                date: new Date(),
                focus,
                difficulty,
                intensity,
                duration,
                single_exercise,
                muscle_group,
                comments: []
            })
            res.statusCode = 200
            res.send(result);
        } catch (e) {
            res.send("Server Error")
            res.statusCode = 500
            console.log(e)
        }
    })

    // One Workout by ID - Get

    app.get('/workouts/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("workout_entry").findOne({
                '_id': ObjectId(req.params.id)
            });
            res.statusCode = 200
            res.send(result)
        } catch (e) {
            res.statusCode = 500
            res.send({
                "Message": "Unable to get workouts"
            })
        }

    })

    // Workout Entry by ID - Put

    app.put("/workouts/edit/:id", async (req, res) => {

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
            res.statusCode = 200
            res.send({
                'Message': 'Workout updated'
            })
        } catch (e) {
            res.statusCode = 500
            res.send({
                'Message': "Unable to update workout"
            })
            console.log(e);
        }
    });

    // Workout Entry by ID - Delete

    app.delete('/workouts/delete/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let results = await db.collection("workout_entry").deleteOne({
                '_id': ObjectId(req.params.id)
            })

            res.statusCode = 200
            res.send(results)
            

        } catch (e) {
            res.statusCode = 500
            res.send({
                "Message": "Unable to delete workouts"
            })
        }
    })



    // All Comments for one workout- Get

    app.get('/workouts/:id/comments', async (req, res) => {

        try {
            let db = MongoUtil.getDB();
            let results = await db.collection("workout_entry").find({
                "_id": ObjectId(req.params.id)
            }).project({
                'comments': 1
            }).toArray()

            res.statusCode = 200
            res.send(results)

        } catch (e) {
            res.statusCode = 500
            res.send({
                "Message": "Unable to get comments"
            })
        }
    })

    // Each Comment - Post

    app.post('/workouts/:id/comments/create', async (req, res) => {
        try {
            let db = MongoUtil.getDB()

            let {
                comment_name,
                comment_text
            } = req.body

            let results = await db.collection("workout_entry").updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$push': {
                    'comments': {
                        id: new ObjectId(),
                        comment_date: new Date(),
                        comment_name,
                        comment_text
                    }
                }
            })
            res.statusCode = 200
            res.send(results)

        } catch (e) {
            res.statusCode = 500
            res.send({
                "Message": "Unable to insert comment"
            });
            console.log(e)
        }

    })

    // Each Comment - Put

    app.put('/workouts/:id/comments/edit/:c_id', async (req, res) => {

        try {
            let db = MongoUtil.getDB()

            let {
                comment_name,
                comment_text
            } = req.body


            let results = await db.collection('workout_entry').updateOne({

                'comments': {
                    '$elemMatch': {
                        'id': ObjectId(req.params.id)
                    }
                }

            }, {

                '$set': {
                    'comments.$.comment_date': new Date(),
                    'comments.$.comment_name': comment_name,
                    'comments.$.comment_text': comment_text
                }

            })

            res.statusCode = 200
            res.send(results)

        } catch (e) {

            res.statusCode = 500
            res.send({
                "Message": "Unable to update comment"
            });
            console.log(e)
        }
    })

    // Each Comment - Delete

    app.delete('/workouts/:id/comments/:c_id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();

            // let results = await db.collection("workout_entry").deleteOne({
            //     '_id': ObjectId(req.params.id)
            // })

            // Step 1: retrieve the workout using workout id
            let workout = await db.collection("workout_entry").findOne({
                '_id': ObjectId(req.params.id)
            })

            if (workout) {
                let clone = []
                if (workout.comments.length > 1) {
                    let oldComment = workout.comments;
                    let indexToDelete = oldComment.findIndex((s) => {
                        return s.id == req.params.c_id;
                    });

                    clone = [
                        ...oldComment.slice(0, indexToDelete),
                        ...oldComment.slice(indexToDelete + 1)
                    ];
                }

                let results = await db.collection("workout_entry").updateOne({
                    '_id': ObjectId(req.params.id)
                }, {
                    $set: {
                        "comments": clone
                    }
                })

                res.statusCode = 200
                res.send(results)
            }
        } catch (e) {
            res.statusCode = 500
            res.send({
                "Message": "Unable to delete comment"
            })
        }
    })


}

main()

// start server
app.listen(3000, () => {
    console.log("Server has started")
})