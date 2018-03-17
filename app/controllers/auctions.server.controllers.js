const auctions = require('../models/auctions.server.models'),
    auth = require('../models/authentication.server.models');

exports.getAll = function(req, res) {
    // partial implementation
    auctions.getAll(function(result) {
        res.send(result);
    });
};

exports.create = function(req, res) {
    let token = req.get('X-Authorization');
    auth.checkToken(token, function(userId) {
       if (userId) {
           let auction_data = [[
               req.body.title,
               req.body.categoryId,
               req.body.description,
               req.body.reservePrice,
               req.body.startingBid,
               req.body.startDateTime,
               req.body.endDateTime
           ]];
           auctions.create(token, auction_data, function(result) {
               //users.get() could get the user_id from the token here and append to auciton_data for better mvc structure
               if (result) {
                   res.status(201).send({"id": result});
               } else {
                   res.send("failed");
               }
           });
       } else {
           res.status(401).send();
       }
    });
};

exports.getOne = function(req, res) {
    let auctionId = req.params.auctionId;
    // response skeleton
    let response = {
        "categoryId": 0,
        "categoryTitle": "string",
        "title": "string",
        "reservePrice": 0,
        "startDateTime": 0,
        "endDateTime": 0,
        "description": "string",
        "createtionDateTime": 0,
        "photoUris": [],
        "seller": {
            "id": 0,
            "username": "string",
        },
        "currentBid": 0,
        "bids": []
    };
    auctions.getOne(auctionId, function(auctionRows) {
        if (auctionRows) {
            // adding auction data response JSON
            response["categoryId"] = auctionRows[0]["auction_categoryid"];
            response["categoryTitle"] = auctionRows[0]["auction_title"];
            response["reservePrice"] = auctionRows[0]["auction_reserveprice"];
            response["startDateTime"] = auctionRows[0]["auction_startingdate"];
            response["endDateTime"] = auctionRows[0]["auction_endingdate"];
            response["description"] = auctionRows[0]["auction_description"];
            response["creationDateTime"] = auctionRows[0]["auction_creationdate"];
        } else {
            res.send(404);
            return;
        }
        let userId = auctionRows[0]["auction_userid"];
        // adding seller data to response JSON
        auctions.getSeller(userId, function(sellerRows) {
            let userName = sellerRows[0]["user_username"]
            response["seller"] = {"id": userId, "username": userName};
            // adding bid data to response JSON
            auctions.viewBids(auctionId, function(bids) {
                response["bids"] = bids;
                // after all info added to JSON response, send the response
                res.status(200).send(response);
            });
        });
    });
};

exports.alter = function(req, res) {
    auctions.alter(function(result) {
        res.send(result);
    });
};

exports.viewBids = function(req, res) {
    let auctionId = req.params.auctionId;
    auctions.viewBids(auctionId, function(result) {
        if (result) {
            res.status(200).send(result);
        } else {
            res.send(404).send();
        }
    });
};

exports.makeBid = function(req, res) {
    let token = req.get('X-Authorization');
    let auctionId = parseInt(req.params.auctionId);
    let amount = parseFloat(req.query.amount);

    auth.checkToken(token, function(userId) {
        if (userId) {
            auctions.makeBid([userId, auctionId, amount, 0], function(result) {
                res.status(201).send(result);
            });
        } else {
            res.status(404).send();
        }
    });
};