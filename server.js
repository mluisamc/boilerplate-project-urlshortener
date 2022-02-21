require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const { Schema } = mongoose;
const urlSchema = new Schema({
  originalUrl :  String,
  shortUrl: Number
});

let Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.route('/api/shorturl').post((function (req, res) {

  Url.findOne({}, {}, { sort: { 'shortUrl' : -1 } }, function(err, url) {
    var url = new Url({originalUrl: req.body.url, shortUrl: url.shortUrl + 1});

    url.save(function(err, data) {
      if (err) return console.error(err);
      res.json({ original_url : data.originalUrl, short_url : data.shortUrl})
    });
  })
  
}))

app.get('/api/shorturl/:number', function(req, res) {
  Url.findOne({shortUrl: req.params.number}, function (err, url) {
     if (err) return console.log(err);
     res.json({ original_url : url.originalUrl, short_url : url.shortUrl})
   });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
