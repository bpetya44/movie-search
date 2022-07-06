const express = require('express');
const app = express();
const cors = require('cors');
const {MongoClient, ObjectId} = require('mongodb');
const { request } = require('express');
const PORT = 8000;

require('dotenv').config();

let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = process.env.DB_NAME,
    collection = process.env.DB_COLLECTION

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('Connected to db ' + dbName);
        db = client.db(dbName)
        // collection = db.collection('movies')
    });

    app.use(express.urlencoded({ extended: true}));
    app.use(express.json());
    app.use(cors());

//'/search' is linked in main.js
    app.get('/search', async (req, res) => {
        try{
            let result = await collection.aggregate([
                {
                    "$Search" : {
                        "autocomplete" : {
                            "query" : `${request.query.query}`,
                            "path" : "title",
                            "fuzzy" : {
                                "maxEdits" : 2,
                                "prefixLength" : 3
                            }
                        }
                    }
                }
            ]).toArray();
            res.send(result);
        } catch (err) {
            res.status(500).send({message: err.message});
        }
    });
    
    // get the data that was clicked on from the result of the 1st get request
    app.get('/get/:id', async (req, res) => {
        try{
            let id = req.params.id;
            let result = await collection.findOne({
                "_id": ObjectId(id),
            });

            res.send(result);

        } catch(err) {
            res.status(500).send({message: err.message});
        }
    })


    app.listen(process.env.PORT || PORT, () => {
        console.log('Listening on port ' + PORT);
    });