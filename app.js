const express = require('express');
const path = require('path');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const moment = require('moment');
const session = require('express-session');
const passport = require('passport');
const config = require('dotenv').config();
const connectDB = require('./config/database');
const tasks = require('./routes/tasks');
const users = require('./routes/users');

// Passport Config
require('./middleware/passport')(passport);

// Init App
const app = express();
connectDB();

// Set View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.APP_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    let namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Setting current logged in user
app.get('*', function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});
// To make available in pug templates
app.locals.moment = moment;


// Route Files
app.get('/', function (req, res) {
  res.render('home');
}); // Home Route

app.use('/tasks', tasks);
app.use('/users', users);

// Start Server
app.listen(3000, function () {
  console.log('Server started on port 3000...');
});
