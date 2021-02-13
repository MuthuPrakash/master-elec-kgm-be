var express = require("express");
var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var bodyParser= require('body-parser')
// Connect to the db

var app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port ", PORT);

    MongoClient.connect("mongodb+srv://masterelectricals:Masterelectricals@cluster0.1dhzp.mongodb.net/sampledb?retryWrites=true&w=majority", { useNewUrlParser: true }, (error, client) => {
        if (error) {
            throw error;
        }
        database = client.db("sampledb");
        collection = database.collection("samplecoll");
        console.log("Connected to db!");
    });

});

app.get("/ping", (req, res, next) => {
    res.json("pong");
});

app.post("/api/items", (request, response) => {
     collection.findOneAndUpdate({bookid: request.body.bookid}, {$set: request.body}, {upsert: true}, (error, result) => {
        console.log('request.body: ', request.body)
        if (error) {
            return response.status(500).json(error);
        }
        console.log('result: ', result);
        response.status(200).json(result);
    });
});

app.get("/api/items", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).json(error);
        }
        console.log(result);
        response.send(result);
    });
});