var express = require("express");
var schema = require('./schema');
var courses = express.Router();

var coursesModel = schema.coursesModel;
var usersModel = schema.usersModel;

courses.get('/allCourses', function (req, res) {
    coursesModel.find(function (err, success) {
        res.send(err || success)
    }).populate('creator', 'firstName lastName profileImg email');
});

courses.get('/myCreatedCourses', function (req, res) {
    coursesModel.find({creatorID: req.query.creatorID}, function (err, success) {
        res.send(err || success)
    }).populate('lessons creator')
});


courses.get('/myJoinedCourses', function (req, res) {
    coursesModel.findOne({_id: req.query.courseID}, function (error, success) {
        res.send(error || success);
    }).populate('lessons creator');
});

courses.get('/findOneCourse', function (req, res) {
    coursesModel.findOne({_id: req.query.courseID}, function (error, success) {
        res.send(error || success);
    }).populate('lessons students');
});

/*courses.use('/joinCourse', function (req, res, next) {
 usersModel.findOne({_id: req.body.userID}, {courses: {$in: [req.body.courseID]}}, function (e, a) {
 console.log(e, a);
 next()
 })
 });*/
courses.post('/joinCourse', function (req, res) {
    console.log(req.body);
    usersModel.update({_id: req.body.userID}, {$push: {joinedCourses: req.body.courseID}}, function (err, success) {
        if (success) {
            coursesModel.update({_id: req.body.courseID}, {$push: {students: req.body.userID}}, function (error, OK) {
                OK ? res.send({code: 1}) : res.send(error);
            });
        }
        else {
            res.send(err)
        }
    });
});

courses.post('/create_course', function (req, res) {
    req.body.creator = req.body.creatorID;
    var course = new coursesModel(req.body);
    course.save(function (error, success) {
        usersModel.update({_id: req.body.creatorID}, {$push: {createdCourses: success._id}}, function (err, OK) {
            success && OK ? res.send({code: 1, course: success}) : res.send(err || error);
        });
    });
});


module.exports = courses;
