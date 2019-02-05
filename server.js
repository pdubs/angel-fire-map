var express    = require('express');
var app        = express();
var path = require('path');
var port = process.env.PORT || 8080;
var router = express.Router();

var mongoose   = require('mongoose');
var Trail      = require('./app/models/trail');
mongoose.connect('mongodb://weirc:weirc1717@ds021681.mlab.com:21681/trail_api');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

router.get('/trails', function(req, res) {
    Trail.find().sort('properties.segment').find(function(err, trails) {
        if (err) { res.send(err); }
        console.log('* serving all trails');
        res.json(trails);
    });
});

app.use('/api', router);
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
console.log('======= SERVER STARTED =======');