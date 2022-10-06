const express = require("express");
const router = express.Router();
const User = require("./models/users.model");
const { google } = require('googleapis');
const path = require("path");

const client_id = "555301616961-0np9e935e8669e12qa4960216a9mkb4v.apps.googleusercontent.com";
const client_secret = "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";
var redirect_uris;
if (process.env.NODE_ENV === "production") {
    redirect_uris = [process.env.LOCAL_LIVE_URL + "/api/google/gettoken"];
} else {
    redirect_uris = [process.env.LOCAL_DEVP_BACKEND_URL + "/api/google/gettoken"];
}
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let postLoginURL;
if (process.env.NODE_ENV == "production") {
    postLoginURL = process.env.LOCAL_LIVE_URL;
} else {
    postLoginURL = process.env.LOCAL_DEVP_URL;
}

router.get("/debug", async (req, res, next) => {
    res.send("debug");
    res.redirect(path.resolve(__dirname, '../client/build', 'index.html/login?from=settings'));
});

router.get("/gettoken", async (req, res, next) => {
    var io = req.app.get('socketio');
    const token = req.query;
    const username = token.state;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const data = await oAuth2Client.getToken(token);
    const tokens = data.tokens;
    oAuth2Client.setCredentials(tokens);
    User.updateOne({ username: username }, { gapiToken: tokens }, function (error, found) {
        if (!error) {
            console.log(found);
            res.redirect(postLoginURL + "/login?from=/settings");
            // res.send("成功登入 Google Calendar，請關閉此分頁。");
            io.to("logingoogle_" + username).emit('forceRefresh');
        } else {
            console.log(error);
            return (error);
        }
    });
});

router.post("/gapigetlink", async (req, res, next) => {
    const user = req.body;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
		include_granted_scopes: true,
		prompt:'consent',
        scope: SCOPES,
        state: user.username,
    });
    res.json({
        status: "success",
        authUrl: authUrl
    })
});

router.post("/getusertoken", async (req, res, next) => {
    const user = req.session.user;
    const userData = await User.findOne({ username: user.username }).exec();
    if (userData.gapiToken != undefined) {
        res.json({
            status: "success",
            token: true
        });
    } else {
        res.json({
            status: "success",
            token: false
        });
    }

});

router.delete("/deletegapidata", async (req, res, next) => {
    const user = req.body;
    User.updateOne({ username: user.username }, { $unset: { gapiToken: "" } }, function (error, foundUser) {
        if (!error) {
            if (foundUser != null) {
                console.log(foundUser)
                res.json({
                    status: "success",
                    message: user.username + " has successfully been updated."
                });
            }
        } else {
            console.log(error);
            return (error);
        }
    });
});

module.exports = router;
