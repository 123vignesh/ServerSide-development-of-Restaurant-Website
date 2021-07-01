var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var fileStore = require('session-file-store')(session)
var passport = require('passport');
var authenticate = require('./authenticate');
var multer = require('multer')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishesRouter = require('./routes/DishRouter');
var promotionsRouter = require('./routes/promoRouter');
var leadersRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoritesRouter = require('./routes/favoriteRouter');
var commentsRouter = require('./routes/commentRouter');


var config = require('./config')

const url = config.mongoUrl;
var connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

var app = express();
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
})



connect.then((db) => {
  console.log("connected to the server")
})
  .catch((err) => {
    console.log(err)
  })


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(cookieParser('Shruthi127Vignesh146erte'));


app.use(passport.initialize());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/imageupload', uploadRouter)


app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishesRouter);
app.use('/dishes/:dishId', dishesRouter);
app.use('/promotions', promotionsRouter);
app.use('/promotions/:promoId', promotionsRouter);
app.use('/leaders', leadersRouter);
app.use('/leaders/:leaderId', leadersRouter);
app.use('/favorites', favoritesRouter);
app.use('/comments', commentsRouter);






// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
