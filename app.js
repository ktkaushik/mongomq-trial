
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , MongoMQ = require('mongomq').MongoMQ
  , sendgrid = require('sendgrid')
  , mongoose = require('mongoose')
  , hbs = require('hbs')
  , Schema = mongoose.Schema;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

mongoose.connect('mongodb://localhost/mongomq');

var MongoMQ = new MongoMQ();

var sendgrid = require('sendgrid')( 'hintwhisper', 'Optcentral2005');

app.get('/send_email', function (req, res, next) {
  console.log('emitting an event .........');

  var emailData = {
          to:       'thirthappa.kaushik@gmail.com',
          from:     'kaushik@optcentral.com',
          subject:  'Hello World',
          text:     'My first email through SendGrid using MongoMQ.'
        };

  MongoMQ.on('email', emailData, function (err, messageContents, next) {
    console.log('in the callback of the ON binder for MongoMQ %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    if(err){
      console.log('there is an error in the callback of complete callback in ON &&&&&&&&&&&&&&&&&&&&&&&&');
      throw err;
    };
    console.log('Logging data..............');
    // console.log(data);
    sendgrid.send( emailData, function(err, json) {
      if (err) { return console.error(err); }
      console.log(json);
    });


    console.log('logging messageContents .........................');
    console.log(messageContents);

    next();
  });


  MongoMQ.emit('email', {
          to:       'thirthappa.kaushik@gmail.com',
          from:     'kaushik@optcentral.com',
          subject:  'Hello World',
          text:     'My first email through SendGrid using MongoMQ.'
        }, function(err, a) {
          if(err){
            console.log('there is an error in the callback of complete callback in EMIT &&&&&&&&&&&&&&&&&&&&&&&&');
          };
          console.log('logging response ..............................................................');
          console.log('logging response ..............................................................');
          console.log('logging response ..............................................................');
          console.log('logging response ..............................................................');
          console.log(a);
        });

});


app.get('/', routes.index);
app.get('/users', user.list);

MongoMQ.start(function (err) {
  if(err){
    console.log('there has been an error in MongoMQ *************************************************');
    throw err;
  };
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
