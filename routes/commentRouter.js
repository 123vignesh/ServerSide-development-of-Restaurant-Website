var express = require('express');
var commentRouter = express.Router()
var cors = require('./cors');

commentRouter.use(express.json());

var Comments = require('../models/comments');

commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Comments.find({})
            .populate('author')
            .then((comments) => {
                if (comments !== null) {

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comments)

                }
                else {
                    res.statusCode = 404;
                    var err = new Error("Your comment is not found")
                    return next(err)
                }
            }, (err) => next(err))
            .catch((err) => {
                return next(err)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        req.body.author = req.user._id
        Comments.create(req.body)
            .then((comments) => {
                if (comments !== null) {
                    comments.find({})
                        .populate('author')
                        .then((comments) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(comments)
                        }, (err) => next(err))
                        .catch((err) => {
                            return next(err)
                        })
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.send('PUT operation is not supported')
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmins, (req, res, next) => {
        if (req.user.admin) {
            Comments.findOneAndDelete({})
                .then((comments) => {
                    Comments.find({})
                        .populate('author')
                        .then((comments) => {
                            console.log("comments deleted")
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(comments)
                        }, (err) => next(err))
                        .catch((err) => {
                            return next(err)
                        })

                }).catch((err) => {
                    return next(err)
                })


        }
        else {
            res.statusCode = 403;
            var err = new Error("You are not authorized to perform this operation!")
            return next(err)
        }

    })

commentRoute.route('/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, cors.cors, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .populate('author')
            .then((comments) => {

                if (comments !== null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes.comments[i])
                    return
                }
                else {

                    res.statusCode = 404;
                    var err = new Error("your comment " + req.params.commentId + " is not found")
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
            comments.findById(req.params.commentId)
                .then((comments) => {
                    if (comments !== null) {
                        if ((req.user._id).equals(comments.author)) {
                            req.body.author = req.user._id;
                            Comments.create(req.body)
                                .then((comments) => {

                                    comments.findById(req.params.commentId)
                                        .populate('author')
                                        .then((comments) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(comments);
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
                    else {
                        res.statusCode = 403;
                        var err = new Error("your comment not obtained")
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
            if ((req.user._id).equals(comments.author)) {
                Comments.findByIdAndRemove(req.params.commentId)
                    .then((comments) => {
                        Comments.findById(req.params.commentId)
                            .populate('comments.author')
                            .then((comments) => {
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
                var err = new Error("you are not authorised to delete others comment")
                return next(err)
            }
        } else {
            res.statusCode = 403;
            var err = new Error("Admins are not authorised to delete others comment")
            return next(err)
        }
    })