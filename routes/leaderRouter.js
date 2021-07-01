const express = require('express');
const bodyParser = require('body-parser')
var authenticate = require('../authenticate')
const app = express();
var cors = require('./cors')
app.use(express.json())

var Leaders = require('../models/leaders');
const LeaderRouter = express.Router();

LeaderRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Leaders.find(req.query)
            .then((leaders) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leaders)
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        authenticate.verifyAdmin(req.user)
        if (req.user.admin) {
            Leaders.create(req.body)
                .then((leaders) => {
                    console.log("your leader has been created")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(leaders)
                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        } else {
            res.statusCode = 403;
            var err = new Error("You are not authorized to perform this operation!")
            return next(err)
        }
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.send('PUT operation is not supported')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        authenticate.verifyAdmin(req.user)
        if (req.user.admin) {
            Leaders.remove({})
                .then((leaders) => {
                    console.log("your leader has been deleted")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(leaders)
                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        } else {
            res.statusCode = 403;
            var err = new Error("You are not authorized to perform this operation!")
            return next(err)
        }
    })

LeaderRouter.route('/:leaderId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Leaders.findById(req.params.leaderId)
            .then((leaders) => {
                if (leaders !== null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(leaders)
                }
                else {
                    res.statusCode = 404;
                    var err = new Error("your leader " + req.params.leaderId + " is not found")
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.send('Post operation is not Supported')
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        authenticate.verifyAdmin(req.user)
        if (req.user.admin) {
            Leaders.findByIdAndUpdate(req.params.leaderId, {
                $set: req.body
            }, {
                new: true
            })
                .then((leaders) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(leaders)
                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        } else {
            res.statusCode = 403;
            var err = new Error("You are not authorized to perform this operation!")
            return next(err)
        }
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        authenticate.verifyAdmin(req.user)
        if (req.user.admin) {
            Leaders.findByIdAndRemove(req.params.leaderId)
                .then((leaders) => {
                    console.log("Your leader removed")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(leaders)
                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        } else {
            res.statusCode = 403;
            var err = new Error("You are not authorized to perform this operation!")
            return next(err)
        }
    })
module.exports = LeaderRouter