var passport = require('passport');
var LocalStratergy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');

var facebookTokenStratergy = require('passport-facebook-token');

var jwtStratergy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var Users = require('./models/users');
var config = require('./config');


passport.use(new LocalStratergy(Users.authenticate()));




exports.getToken = (user) => {

    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600 });

}

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new jwtStratergy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        Users.findOne({ _id: jwt_payload._id }, (err, user) => {

            if (err) {

                return done(err, false);
            }
            else if (user) {
                if (user.username === "admin") {
                    user.admin = true
                }
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (user, next) => {
    console.log(user.username)
    if (user.username === "admin") {
        user.admin = true;
        return
    }



    //error handling in router with next

};
exports.verifyAdmins = (req, res, next) => {
    if (req.user.username === "admin") {
        req.user.admin = true
        next()
    } else {

        var err = new Error("You are not authorised to perform this operation")
        return next(err)
    }
}

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser())