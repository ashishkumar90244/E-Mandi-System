// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');

// const { Vonage } = require('@vonage/server-sdk');

// //const app = express();

// // Replace with your actual Vonage API credentials
// const vonage = new Vonage({
//   apiKey: '2175db94',
//   apiSecret: 'KfOLYAzxE8eWQHCT'
// });
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var fileUpload = require('express-fileupload');
var busboy = require('busboy');
var url = require('url');
var app      = express();
var port     = process.env.PORT || 8080;

var passport = require('passport');
var flash    = require('connect-flash');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration



// set up our express application
app.use(fileUpload());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname,"views")));
//app.use(cookieParser()); //



// routes ======================================================================
require('./app/routes.js')(app, passport,url, path); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
