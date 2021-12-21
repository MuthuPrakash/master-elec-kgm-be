
var cors = require('cors');
var express = require("express");
var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser')

// Connect to the db

var app = express();

var corsObj = {
    'origin': ['http://localhost:3000', 'http://localhost:3000/products','http://localhost:3000/orderSummary', 'https://masterelectricalskangayam.web.app/products','https://masterelectricalskangayam.web.app/orderSummary',],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE'
};

app.use(cors(corsObj));

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
        inventoryCollection = database.collection("inventory");
        inventoryRentalCollection = database.collection("inventoryRental");
        console.log("Connected to db!");
    });

});

app.get("/ping", (req, res, next) => {
    res.json("pong");
});

app.post("/api/items", (request, response) => {
    collection.findOneAndUpdate({ bookid: request.body.bookid }, { $set: request.body }, { upsert: true }, (error, result) => {
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

app.get("/api/inventory", (request, response) => {
    inventoryCollection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).json(error);
        }
        console.log(result);
        response.send(result);
    });
});

app.get("/api/inventoryRental", (request, response) => {
    inventoryRentalCollection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).json(error);
        }
        console.log(result);
        response.send(result);
    });
});

app.post("/api/addInventoryRental", (request, response) => {

    var rentalObj = {};
    rentalObj = { ...request.body };
    delete rentalObj["availableQuantity"];

    if (request.body != undefined) {
        console.log("request.body.isUpdate ***** ", request.body.isUpdate);

        if (!request.body.isUpdate) {
            inventoryRentalCollection.insertOne(rentalObj, (error, result) => {
                console.log('request.body *** : ', request.body)
                if (error) {
                    console.log(error);
                    return response.status(500).json(error);
                }
                console.log('inventoryRentalCollection insert success *** : ', result);
                response.status(200).json(result.ops[0]);
            });

            inventoryCollection.findOneAndUpdate({ productId: request.body.productId }, { $set: { availableQuantity: request.body.availableQuantity } }, { upsert: true }, (error, result) => {
                console.log('request.body: ', request.body)
                if (error) {
                    return response.status(500).json(error);
                }
                console.log('inventoryCollection - availableQuantity reduction success: ', result);
                response.status(200).json(result);
            });
        }
        else {

            inventoryRentalCollection.findOneAndUpdate({ rentalId: request.body.rentalId }, { $set: rentalObj }, { upsert: true }, (error, result) => {
                console.log('request.body: ', request.body)
                if (error) {
                    return response.status(500).json(error);
                }
                console.log('result: ', result);
                response.status(200).json(result);
            });


            if (request.body.isReturned) {

                inventoryCollection.findOneAndUpdate({ productId: request.body.productId }, { $set: { availableQuantity: request.body.availableQuantity } }, { upsert: true }, (error, result) => {
                    console.log('request.body: ', request.body)
                    if (error) {
                        return response.status(500).json(error);
                    }
                    console.log('inventoryCollection - availableQuantity reduction success: ', result);
                    response.status(200).json(result);
                });
            }
        }


    }

});
