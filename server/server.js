//server/server.js
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('./passport');

// required routes
const recipes = require('./routes/recipes.js');
const users = require('./routes/users.js');

const app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client'));

// serve file in client and public
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static('public'));

// common setup
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'shibainu',
  resave: true,
  saveUninitialized: true
}));

// passport init
app.use(passport.initialize());
app.use(passport.session());

// https redirect
app.use((req, res, next) => {
  if (req.protocol === 'https') {
    next();
  } else {
    res.redirect('https://localhost:8001' + req.url);
  }
});

// connect to database
mongoose.connect('mongodb://localhost:27017/recipes')
.then(
  () => {
    console.log('Connect to database successfully.');
  },
  err => {
    console.log('Connect to db failed: ' + err);
  }
);

// use routes
app.use('/recipes', recipes);
app.use('/users', users);

//render index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  res.render('index');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports=app;