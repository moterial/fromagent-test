const { google } = require('googleapis');
const User = require("../models/users.model.js");

const client_id = "555301616961-0np9e935e8669e12qa4960216a9mkb4v.apps.googleusercontent.com";
const client_secret = "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";
var redirect_uris;
if (process.env.NODE_ENV === "production") {
    redirect_uris = [process.env.LOCAL_LIVE_URL + "/api/users/gettoken"];
} else {
    redirect_uris = [process.env.LOCAL_DEVP_BACKEND_URL + "/api/users/gettoken"];
}
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * 
 * @param {string} username 
 * @param {function (OAuth2Client)} callback performs operations to the Google Account
 */

module.exports.ExecuteGoogleAPI = function ExecuteGoogleAPI(username, callback) {
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    User.findOne({ username: username }, function (error, currentUser) {
        if (!error) {
            const credentials = currentUser.gapiToken;
            oAuth2Client.setCredentials(credentials);
            callback(oAuth2Client);
        } else {
            console.log(error);
            return (error);
        }
    });
}

module.exports.createMeeting = function createMeeting(data, auth) {
    if (auth == null) {
        console.log("Error: createMeeting must be used as a callback of ExecuteGoogleAPI.");
        return;
    }
    const calendar = google.calendar({ version: 'v3', auth });
    const summary = "與客戶 " + data.clientName + " 的會議";
    const description = `生意類別：${data.businessCategories.join("，")}`+
        `\n項目：${data.item.join("，")}` + 
        `\n備註：${data.note != null? data.note: "無"}`;
    const startDate = new Date(data.nextDate);
    startDate.setHours(12);
    const endDate = new Date(data.nextDate);
    endDate.setHours(13);
    const event = {
        "summary": summary,
        "description": description,
        "start": {
            "dateTime": startDate,
            "timeZone": "Asia/Hong_Kong",
        },
        "end": {
            "dateTime": endDate,
            "timeZone": "Asia/Hong_Kong",
        },
        "reminders": {
            "useDefault": false,
            "overrides": [
                {
                    "method": "popup",
                    "minutes": 60 * 3,
                }
            ],
        }
    };
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event,
    }, function (error, event) {
        if (!error) {
            console.log("Event created %s", event.htmlLink)
        } else {
            console.log("Error creating event: " + error);
            return;
        }
    }
    );
}

module.exports.createInterview = function createInterview(data, auth) {
    if (auth == null) {
        console.log("Error: createInterview must be used as a callback of ExecuteGoogleAPI.");
        return;
    }
    const calendar = google.calendar({ version: 'v3', auth });
    const summary = "與招募者 " + data.candidateName + " 的會議";
    const description = `類別：${data.categories.join("，")}`+
        `\n項目：${data.item.join("，")}` + 
        `\n備註：${data.note != null? data.note: "無"}`;
    const startDate = new Date(data.nextDate);
    startDate.setHours(12);
    const endDate = new Date(data.nextDate);
    endDate.setHours(13);
    const event = {
        "summary": summary,
        "description": description,
        "start": {
            "dateTime": startDate,
            "timeZone": "Asia/Hong_Kong",
        },
        "end": {
            "dateTime": endDate,
            "timeZone": "Asia/Hong_Kong",
        },
        "reminders": {
            "useDefault": false,
            "overrides": [
                {
                    "method": "popup",
                    "minutes": 60 * 3,
                }
            ],
        }
    };
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event,
    }, function (error, event) {
        if (!error) {
            console.log("Event created %s", event.htmlLink)
        } else {
            console.log("Error creating event: " + error);
            return;
        }
    }
    );
}

module.exports.createEvents = function createEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming 10 events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}

module.exports.genAuthUrl = function genAuthUrl(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: "k",
    });
    return authUrl;
}

module.exports.isConnectedToGAPI = async function isConnectedToGAPI(username) {
    const user = await User.findOne({ username: username }).exec();
    if (user != null) {
        if (user.gapiToken != undefined) {
            return (true);
        }
    }
    return (false);
}
