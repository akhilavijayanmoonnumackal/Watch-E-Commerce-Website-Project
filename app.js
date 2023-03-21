const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs=require('express-handlebars');
const db=require('./config/connection');
const handlebars=require('handlebars');
const mathHelpers=require('./helpers/math-helpers');
const session=require('express-session');
const nocache=require('nocache')
require('dotenv').config();


//Database connection
db.connect((err)=>{
  if(err) console.log("Connection Error");
  else console.log("Database connected to the port");
})


const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');


const app = express();


// view engine setup

handlebars.registerHelper(mathHelpers);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs', defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/', partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache())
app.use(cookieParser());
app.use(session({resave:false, saveUninitialized:true, secret:"key", cookie:{maxAge:600000}}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
