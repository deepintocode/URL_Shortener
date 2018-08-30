'use strict';

require('dotenv').config();
const express = require('express'),
     mongoose = require('mongoose'),
   bodyParser = require('body-parser'),
         cors = require('cors'),
    urlExists = require('url-exists');

const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

const urlSchema = new mongoose.Schema({
  'original_url': String,
  'short_url': Number  
});

const Url = mongoose.model('Url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", (req, res) => {
  res.json({greeting: 'hello API'});
});

app.get('/api/shorturl/:id', (req, res) => {
  Url.findOne({short_url: req.params.id})
  .then(data => res.redirect(data.original_url))
  .catch(err => console.log(err));
});

app.post('/api/shorturl/new', (req, res) => {
  urlExists(req.body.url, (err, exists) => {
    if(exists) {
      Url.find().estimatedDocumentCount()
    .then(count => {
      const response = { 'original_url': req.body.url, 'short_url': count + 1 };
      Url.create(response)
      .then(() => res.json(response))
      .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
    } else {
      res.send('The URL you entered is not valid.');
    }
  });
});

app.listen(port, () => {
  console.log(`Node.js listening at port ${port}...`);
});