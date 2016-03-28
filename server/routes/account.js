var express = require("express");
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var account = express.Router();
var user;

var usersSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    profileImg: {type: String},
    email: {type: String, required: true},
    theme: {type: String},
    password: {type: String, required: true},
    progress: {type: Array},
    sex: {type: Number, required: true},
    tel: {type: Number, required: true},
    role: {type: Number, default: 1},
    createdOn: {type: Date, default: Date.now()},
    courses: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Courses'}]},
    quizzes: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Quizzes'}]}
});
var socialUsersSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    progress: {type: Array},
    profileImg: {type: String, required: true},
    email: {type: String},
    link: {type: String, required: true},
    userID: {type: String, required: true},
    theme: {type: String},
    sex: {type: Number, required: true},
    tel: {type: Number},
    role: {type: Number, default: 1},
    createdOn: {type: Date, default: Date.now()},
    courses: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Courses'}]},
    quizzes: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Quizzes'}]}
});
var usersModel = mongoose.model("Users", usersSchema);
var socialUsersModel = mongoose.model("SocialUsers", socialUsersSchema);
exports.usersModel = usersModel;
exports.usersModel = socialUsersModel;


/* Social User Auth*/

account.use('/socialUserAuth', function (req, res, next) {
    socialUsersModel.findOne({userID: req.body.userID}, function (err, success) {
        success ? res.send({code: 1, user: success}) : next();
    });
});

account.post('/socialUserAuth', function (req, res) {
    var user = new socialUsersModel(req.body);
    user.save(function (error, success) {
        res.send(error || success);
    })
});

/* Checking Email Middleware */
account.use("/login", function (req, res, next) {
    usersModel.findOne({email: req.body.email}, function (err, success) {
        user = success;
        success ? next() : next({code: 0, msg: "بريد إلكتروني خاطئ"});
    })
});
/* Checking Password Middleware */
account.use("/login", function (req, res, next) {
    bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
        req.body.password = null;
        isMatch ? next() : next({code: 0, msg: "كلمة مرور خاطئة"});
    });
});
/* Main Login Rout */
account.post("/login", function (req, res) {
    res.send({code: 1, user: user});
    user = null;
});
/* Error Handling Middleware */
account.use("/login", function (err, req, res, next) {
    res.send(err)
});
/* Bcrypt Password Middleware */
account.use("/signup", function (req, res, next) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, null, function (err, hashed) {
            req.body.password = hashed;
            next();
        });
    });
});
/* Main Signup Rout*/
account.post("/signup", function (req, res) {
    var user = new usersModel(req.body);
    user.save(function (err, success) {
        res.send(err || success)
    });
});

module.exports = account;
