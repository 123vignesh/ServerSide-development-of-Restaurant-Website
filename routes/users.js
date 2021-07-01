var express = require('express');
var router = express.Router();
var passport = require('passport');
var cors = require('./cors')
var authenticate = require('../authenticate')
var Users = require('../models/users');
var bodyParser = require('body-parser');
const { token } = require('morgan');

router.use(express.json());


router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
/* GET users listing. */
router.get('/', authenticate.verifyUser, (req, res, next) => {
  authenticate.verifyAdmin(req.user)
  if (req.user.admin) {
    Users.find({})
      .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      })
  } else {
    res.statusCode = 403;
    var err = new Error("You are not authorized to perform this operation!")
    return next(err)
  }

});



router.post('/signup', (req, res, next) => {
  Users.register(new Users({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {

        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });

      }

    })
})




router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: false, status: 'Login unsuccessfull', err: info });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      else {
        var token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ token: token, success: true, status: 'You are successfully logged in!' });
      }
    })
  })(req, res, next);
});




router.post('/logout', (req, res, next) => {
  if (req.user) {

    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
})

router.get('/checkJWTtoken', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: false, status: 'Login unsuccessfull', err: info });
    }
    else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ success: true, status: 'JWT valid', user: user });
    }

  })(req, res);
})



module.exports = router;
