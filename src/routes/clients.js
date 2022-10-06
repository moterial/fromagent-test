const express = require("express");
const router = express.Router();
const { validate } = require("../utils/session-utils.js");

const Client = require("../models/clients.model.js");
const GoogleAPI = require("../utils/google-api-utils.js");
const ObjectId = require("mongoose").Types.ObjectId;

//router.use(validate);

router.post("/clients", validate, async (req, res, next) => {
    const user = req.body;
    const _clients = await Client.find({ user: user.username }, "clientName").exec();
    let Clients = [];
    _clients.map(
        (_client, index) => {
            Clients.push(_client.clientName);
        }
    )
    res.json(Clients);
});

router.post("/submit", validate, async (req, res, next) => {
    try {
        let client = req.body;
        let currentClient = await Client.findOne({ clientName: client.clientName, user: client.user }).exec();
        if (currentClient == null) {
            currentClient = await Client.create(client);
        }

        // Parse scores 
        let score = 0;
        const items = client.item;
        for (let i = 0; i < items.length; i++) {
            switch (items[i]) {
                case "首次見面":
                    score += 10;
                    break;
                case "Fact Finding":
                    score += 10;
                    break;
                case "睇 Proposal":
                    score += 20;
                    break;
                case "Try Closing":
                    score += 20;
                    break;
                case "Networking":
                    score += 5;
                    break;
                default:
                    console.log("Item not found");
            }
        }
        if (items.includes("Done Deal")) {
            client.score = 0;
            currentClient.mark = 0;
        } else {
            client.score = score;
            currentClient.mark += score;
        }

        // Parse next date
        const currentDate = new Date(client.date);
        const daysAfter = parseInt(client.nextDate);
        const nextDate = currentDate.setDate(currentDate.getDate() + daysAfter);
        client.nextDate = new Date(nextDate);


        Client.findOneAndUpdate(
            { clientName: client.clientName, user: client.user },
            { $push: { meetings: client }, mark: currentClient.mark },
            function (_error, isSuccess) {
                if (_error) console.log(_error)
                else {
                    res.json({
                        status: "success",
                        message: isSuccess.clientName + " has been updated."
                    });
                }
            }
        )

        // Add event to Google Calendar
        const isConnected = await GoogleAPI.isConnectedToGAPI(client.user);
        if (isConnected) {
            GoogleAPI.ExecuteGoogleAPI(client.user, function (auth) {
                GoogleAPI.createMeeting(client, auth);
            });
        }
    } catch {
        console.error(`Error in ${req.path}`)
        res.json({
            status: "error",
            message: "An error has occured"
        })
    }
});

router.post("/meetinglist", validate, (req, res) => {
    const user = req.body;
    Client.find({ user: user.username }, function (error, allClients) {
        if (error) {
            console.log(error);
        }
        res.json(allClients);
    });
});

router.delete("/deleteclients", validate, function (req, res) {
    try {
        const clientList = req.body;
        let deleteCount = 0;
        clientList.map((client, index) => {
            Client.deleteOne({ clientID: client }, function (error, deletedClient) {
                if (!error) {
                    deleteCount++;
                }
                else {
                    console.log(error);
                    return (error);
                }
            })
        })
        res.json({
            status: "success",
            deleteCount: deleteCount
        })
    } catch {
        console.error(`Error in ${req.path}`)
        res.json({
            status: "error",
            message: "An error has occured"
        })
    }
});

router.post("/saveread", validate, async function (req, res, next) {
    
    let id = req.body.id;
    let meetingID = req.body.meetingID;
    console.log(id,meetingID);
    const result = await Client.findOneAndUpdate(
        { _id: new ObjectId(id) ,
         "meetings._id": new ObjectId(meetingID) },
        { $set: { "meetings.$.read": "yes" } },
        {upsert: true},
  
    );
    console.log(result);

    res.json({
        status: result._id
    });
    
});

router.delete("/deletemeeting", validate, async function (req, res, next) {
    try {
        const targetMeeting = req.body;
        const _client = await Client.findOne({ clientID: targetMeeting.clientID }).exec();
        const _client_meeting = _client.meetings.id(targetMeeting.target);
        let newMark = _client.mark - _client_meeting.score;
        if (newMark <= 0) { newMark = 0 };
        Client.findOneAndUpdate(
            { clientID: targetMeeting.clientID },
            { $pull: { meetings: _client_meeting }, mark: newMark },
            function (_error, isSuccess) {
                if (!_error) {
                    res.json({
                        status: "success",
                        message: isSuccess.clientName + " has been updated."
                    })
                }
                else { console.log(_error) }
            }
        )
    } catch {
        console.error(`Error in ${req.path}`)
        res.json({
            status: "error",
            message: "An error has occured"
        })
    }
});

router.post("/changename", async function (req, res, next) {
    const user = JSON.parse(req.body.user);
    const client = req.body.client;
    Client.findOne({ clientName: client.clientNewName, user: user.username }, function (error, foundClient) {
        if (!error) {
            if (foundClient == null) {
                Client.findOneAndUpdate(
                    { clientID: client.clientID },
                    { $set: { clientName: client.clientNewName } },
                    function (error, success) {
                        if (!error) {
                            res.json({
                                status: "success",
                                message: success.clientName + " has been updated."
                            })
                        }
                        else {
                            console.log(error);
                            return (error);
                        }
                    }
                )
            }
            else {
                res.json({
                    status: "failed",
                    message: "ClientName already exist."
                })
            }
        } else {
            console.log(error);
        }
    });

})

module.exports = router;
