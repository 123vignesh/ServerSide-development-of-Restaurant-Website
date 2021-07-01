var express = require('express');
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
var FavoriteRouter = express.Router();

FavoriteRouter.use(express.json())

FavoriteRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .populate('user')
            .populate('dishes.dish')
            .then((Favorite) => {
                if (!Favorite) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    var err = new Error("your Favorite Dishes not found")
                    return next(err)
                } else {

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(Favorite)
                }
            })
            .catch((err) => {

                return next(err)
            })
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        if (req.user.admin === false) {
            Favorites.create({ user: req.user._id })
                .then((favorite) => {

                    for (var i = 0; i < req.body.length; i++) {

                        favorite.dishes.push({ dish: req.body[i] })
                        if (favorite.dishes[i].dish.toString() !== req.body[i]) {
                            favorite.dishes.pop()
                        }
                    }

                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes.dish')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });

                })
                .catch((err) => next(err))
        } else {
            res.send("Admins are not allowed to perform this operation")
        }
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.send("Put operation is not Supported");
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.deleteMany({ user: req.user._id })

            .then((Favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Favorite);
            }).catch((err) => {
                return next(err)
            })
    })

FavoriteRouter.route('/:dishId')
    .get(authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        //not find create and add the dish
        ;
        if (req.user.admin === false) {
            Favorites.find({ user: req.user._id })
                .then((favorite) => {
                    console.log("hi")
                    console.log(favorite)
                    if (favorite.length !== 0) {
                        var present = false;
                        for (var i = 0; i < favorite[0].dishes.length; i++) {
                            if (favorite[0].dishes[i].dish.toString() === req.params.dishId) {
                                present = true;
                            }
                        }

                        if (present === false) {
                            favorite[0].dishes.push({ dish: req.params.dishId });
                            favorite[0].save()
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate('user')
                                        .populate('dishes.dish')
                                        .then((favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        })
                                })
                                .catch((err) => {
                                    return next(err);
                                });
                        } else {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            var err = new Error("Your Dish alredy exist in favorites")
                            return next(err)
                        }
                    } else {
                        Favorites.create({ user: req.user._id })
                            .then((favorite) => {
                                favorite.dishes.push({ dish: req.params.dishId })
                                favorite.save()
                                    .then((favorite) => {
                                        Favorites.findById(favorite._id)
                                            .populate('user')
                                            .populate('dishes.dish')
                                            .then((favorite) => {
                                                res.statusCode = 200;
                                                res.setHeader('Content-Type', 'application/json');
                                                res.json(favorite);
                                            })
                                    })
                                    .catch((err) => {
                                        return next(err);
                                    });

                            })
                            .catch((err) => next(err))
                    }
                })
                .catch((err) => {
                    console.log("Reekd")
                    return next(err)
                })
        } else {
            res.send("Admins are not allowed to perform this operation")
        }
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.send("Put operation is not supported");
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .then((Favorite) => {
                if (Favorite !== null && Favorite[0].dishes.id(req.params.dishId) !== null) {
                    Favorite[0].dishes.id(req.params.dishId).remove();
                    Favorite[0].save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes.dish')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    var err = new Error("Your dish not found")
                    return next(err)
                }

            })
            .catch((err) => {
                console.log(err)
            })
    })

module.exports = FavoriteRouter;