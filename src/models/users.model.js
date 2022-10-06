const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT = 10;

const user = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        parentUser: {
            type: String,
        },
        permissionLevel: {
            type: Number,
            required: true
        },
        profitTarget: {
            type: Number
        },
        recruitmentTarget:{
            type: Number
        },
        gapiToken: {
            access_token: String,
            refresh_token: String,
            scope: String,
            token_type: String,
            expiry_date: String
        },
        securityQuestion1: {
            type: String
        },
        securityQuestion2: {
            type: String
        },
        securityAnswer1: {
            type: String
        },
        securityAnswer2: {
            type: String
        },
    }
);

user.pre('save', function(next){
    let _user = this;
    if (!_user.isModified('password')) return next();
    bcrypt.genSalt(SALT, function (error, salt){
        if (!error){
            bcrypt.hash(_user.password, salt, function (_error, hash){
                if (!_error){
                    _user.password = hash;
                    next();
                } 
                else return (_error);
            })
        }
        else return (error);
    })
});

user.methods.Validate = function(password, callback){
    bcrypt.compare(password, this.password, function (error, isCorrect){
        if (!error){
            callback(null, isCorrect);
        } else return (error);
    }
    );
}

const userModel = mongoose.model("user", user);

module.exports = userModel;
