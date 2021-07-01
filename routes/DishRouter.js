const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate')
var cors = require('./cors')
var Dishes = require('../models/dishes');
const { verifyUser } = require('../authenticate');


const DishRouter = express.Router();//define one express router to different end points

DishRouter.use(express.json())



DishRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);

    })
    .get(cors.cors, (req, res, next) => {
        Dishes.find(req.query)
            .populate('comments.author')
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes)
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {

        if (req.user.admin) {
            Dishes.create(req.body)
                .then((dish) => {


                    console.log("your dish has been created")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish)


                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        } else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.send("Your not authorized to perform this operation")
        }
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {
        res.send('PUT operation is not supported')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {

        if (req.user.admin) {
            Dishes.remove({})
                .populate('comments.author')
                .then((dish) => {
                    console.log("your dish has been deleted")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish)
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

DishRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dishes) => {
                if (dishes !== null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes)
                }
                else {
                    res.statusCode = 404;
                    var err = new Error("your dish " + req.params.dishId + " is not found")
                }
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {
        res.send('Post operation is not Supported')
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {

        if (req.user.admin) {
            Dishes.findByIdAndUpdate(req.params.dishId, {
                $set: req.body
            }, {
                new: true
            })
                .then((dishes) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes)
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
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {

        if (req.user.admin) {
            Dishes.findByIdAndRemove(req.params.dishId)
                .then((dishes) => {
                    console.log("Your dish removed")
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes)
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




//for comment and commentId
/*
DishRouter.route('/:dishId/comments')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {

        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dishes) => {
                if (dishes !== null) {

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes.comments)

                }
                else {
                    res.statusCode = 404;
                    var err = new Error("your dish " + req.params.dishId + " is not found")
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish !== null) {

                    req.body.author = req.user._id
                    dish.comments.push(req.body)

                    dish.save().then((dishes) => {
                        Dishes.findById(dishes._id)
                            .populate('comments.author')
                            .then((dishes) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dishes.comments)
                            }, (err) => next(err))

                    })
                        .catch((err) => {
                            return next(err)
                        })
                }
                else {
                    res.statusCode = 404;
                    var err = new Error("your dish " + req.params.dishId + " is not found")
                    return next(err)
                }

            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.send('PUT operation is not supported')
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {


        if (req.user.admin) {
            Dishes.findById(req.params.dishId)
                .then((dish) => {

                    if (dish !== null) {
                        while (dish.comments.length > 0) {

                            dish.comments.pop()

                        }
                        console.log(dish.comments.length)
                        dish.save()
                            .populate('comments.author')
                            .then((dishes) => {
                                console.log("dishes deleted")
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dishes.comments)
                            }, (err) => next(err))
                            .catch((err) => {
                                return next(err)
                            })
                    }
                    else {
                        res.statusCode = 404;
                        var err = new Error("your dish " + req.params.dishId + " is not found")
                        return next(err)
                    }

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

DishRouter.route('/:dishId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, cors.cors, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dishes) => {
                console.log(dishes.comments.length)
                if (dishes !== null && dishes.comments.length !== 0) {


                    for (var i = 0; i < dishes.comments.length; i++) {
                        if (dishes.comments[i]._id == req.params.commentId) {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dishes.comments[i])
                            return
                        }
                        else {
                            console.log("Fiuik")
                            res.statusCode = 404;
                            var err = new Error("your comment " + req.params.commentId + " is not found")
                            return next(err)
                        }
                    }
                }
                else {
                    res.statusCode = 404;
                    var err = new Error("your dish " + req.params.dishId + " is not found")
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
        if (req.user.admin === false) {
            Dishes.findById(req.params.dishId)
                .then((dish) => {
                    if (dish !== null && dish.comments.id(req.params.commentId) != null) {
                        if ((req.user._id).equals(dish.comments[0].author._id)) {

                            if (req.body.rating) {
                                dish.comments.id(req.params.commentId).rating = req.body.rating;
                            }
                            if (req.body.comment) {
                                dish.comments.id(req.params.commentId).comment = req.body.comment;
                            }
                            dish.save()
                                .then((dish) => {
                                    Dishes.findById(req.params.dishId)
                                        .populate('comments.author')
                                        .then((dish) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(dish);
                                        })
                                }, (err) => next(err))
                                .catch((err) => {
                                    return next(err)
                                })
                        } else {
                            res.statusCode = 403;
                            var err = new Error("your are not authorised to edit others comment")
                            return next(err)
                        }
                    }
                    else if (dish == null) {
                        res.statusCode = 403;
                        var err = new Error("your dish not obtained")
                        return next(err)
                    } else {
                        res.statusCode = 403;
                        var err = new Error("your dish not obtained")
                        return next(err)
                    }
                })
        } else {
            res.statusCode = 403;
            var err = new Error("your are not authorised to delete others comment")
            return next(err)

        }
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin === false) {
            Dishes.findById(req.params.dishId)
                .then((dishes) => {

                    if (dishes != null && dishes.comments.id(req.params.commentId) != null) {
                        if ((req.user._id).equals(dishes.comments[0].author._id)) {
                            dishes.comments.id(req.params.commentId).remove();
                            dishes.save()
                                .then((dish) => {
                                    Dishes.findById(dish._id)
                                        .populate('comments.author')
                                        .then((dish) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(dish);
                                        })
                                }, (err) => next(err))
                                .catch((err) => {
                                    return next(err)
                                })
                        } else {
                            res.statusCode = 403;
                            var err = new Error("your are not authorised to delete others comment")
                            return next(err)
                        }
                    }
                }, (err) => next(err))
                .catch((err) => {
                    return next(err)
                })
        } else {
            res.statusCode = 403;
            var err = new Error("your are not authorised to delete others comment")
            return next(err)
        }
    })*/
module.exports = DishRouter