require('dotenv').config();
const User = require("./src/models/users.model.js");
const connectDB = require("./src/connectdb.js");
const mongoose = require('mongoose');

connectDB();

User.updateMany({}, { $unset: { recruitmentTarget: "", profitTarget: "" } }, function (error, success) {
    if (!error) {
        console.log(success);
        mongoose.connection.close();
        return (success);
    } else {
        console.log(error);
        mongoose.connection.close();
        return (error);
    }
});
