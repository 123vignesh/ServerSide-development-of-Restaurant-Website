const express = require('express');
const bodyParser = require('body-parser')
var authenticate = require('../authenticate');
const app = express();
var cors = require('./cors')
app.use(express.json())

var Promotions = require('../models/promotions');
const PromotionRouter = express.Router();



PromotionRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Promotions.find(req.query)
            .then((promotions) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions)
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        authenticate.verifyAdmin(req.user)
        if (req.user.admin) {
            Promotions.create(req.body)
                .then((promotions) => {
                    console.log("your promotion has been created")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promotions)
                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        }
        else {
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
            Promotions.remove({})
                .then((promotions) => {
                    console.log("your promotion has been deleted")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promotions)
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

PromotionRouter.route('/:promoId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {

        Promotions.findById(req.params.promoId)
            .then((promotions) => {
                if (promotions !== null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promotions)
                }
                else {
                    res.statusCode = 404;
                    var err = new Error("your promotion " + req.params.leaderId + " is not found")
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })

    })
    .post(cors.corsWithOptions, (req, res, next) => {

        res.send('Post operation is not Supported')
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        authenticate.verifyAdmin(req.user)
        if (req.user.admin) {
            Promotions.findByIdAndUpdate(req.params.promoId, {
                $set: req.body
            }, {
                new: true
            })
                .then((promotions) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promotions)
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
            Promotions.findByIdAndRemove(req.params.promoId)
                .then((promotions) => {
                    console.log("Your promotion removed")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promotions)
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
module.exports = PromotionRouter