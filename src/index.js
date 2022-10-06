require('dotenv').config()
const { json } = require("express");
const path = require('path');
const express = require("express");
const secure = require('express-force-https');

const session = require("express-session");
const MongoStore = require("connect-mongo");
const genuuid = require("uuid");
const mongoose = require("mongoose");
const morgan = require("morgan");

// Database Connection 

const db = require("./connectdb.js");
db();


const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const compression = require("compression");
app.use(compression());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

var corsurl
if (process.env.NODE_ENV === "production") {
    corsurl = process.env.LOCAL_LIVE_URL;
} else {
    corsurl = process.env.LOCAL_DEVP_URL;
}

const io = new Server(server, {
    cors: {
        origin: corsurl,
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    socket.on("logingoogle", (arg, callback) => {
        socket.join("logingoogle_" + arg)
    });
});

app.set('socketio', io);


app.use(express.json());

const port = process.env.PORT || 80;

// Server Initialisation

app.use(
    (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', corsurl);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE',"FETCH");
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        next();
    }
);

// ssl
if (process.env.NODE_ENV === "production") {
    app.use(secure);
}

// Session 
var mongoUrl
if (process.env.NODE_ENV === "production") {
    console.log("Session Production");
    mongoUrl = process.env.DB_STRING;
} else {
    console.log("Session Development");
    mongoUrl = process.env.ALTAS_DEVP_URL;

}

app.use(
    session(
        {
            secret: process.env.SESSION_SECRET,
            saveUninitialized: false,
            resave: false,
            cookie: {
                maxAge: null,
                /*secure: process.env.NODE_ENV == "production" ? true : false*/
            },
            store: MongoStore.create({
                mongoUrl: mongoUrl,
                collectionName: "sessions"
            }),
            genid: function (req) {
                return (genuuid.v4());
            }
        }
    )
);

// serve build fils=e
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(function (req, res, next) {
    res.setTimeout(25000, function () {
        res.status(400).json({ message: "錯誤：系統繁忙，請重新載入頁面。" });
    });
    next();
})

server.listen(port, () => {
    console.log('Server is up on port ' + port);
    console.log('websocket on *:' + port);
});


/*app.listen(port, () => {
    console.log('Server is up on port ' + port);
});*/

// Routes

const USERS_ROUTE = require("./routes/users.js");
const CLIENTS_ROUTE = require("./routes/clients.js");;
const CANDIDATES_ROUTE = require("./routes/candidates.js");
const DASHBOARD_ROUTE = require("./routes/dashboard.js");
const CONNECT_GAPI_ROUTE = require("./connectgapi.js");

app.use("/api/users", USERS_ROUTE);
app.use("/api/google", CONNECT_GAPI_ROUTE);
app.use("/api/clients", CLIENTS_ROUTE);
app.use("/api/candidates", CANDIDATES_ROUTE);
app.use("/api/dashboard", DASHBOARD_ROUTE);


// redirect all other request to build file


app.get(/^\/(?!api).*/, (req, res) => {

    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
