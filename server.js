var express    = require('express');
var app        = express();
var port = process.env.PORT || 8080;
var router = express.Router();

// mongoDB setup
var mongoose   = require('mongoose');
var Trail      = require('./app/models/trail');
mongoose.connect('mongodb://weirc:weirc1717@ds021681.mlab.com:21681/trail_api');

// middleware for xhr
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// route for all trails
router.get('/trails', function(req, res) {
    Trail.find(function(err, trails) {
        if (err) { res.send(err); }
        console.log('* serving all trails');
        res.json(trails);
    });
});

// route for trails by park id
router.get('/trails/id/:id', function(req, res) {
    Trail.find({ 'properties.id': req.params.id }, function(err, trails) {
        if (err) { res.send(err); }
        console.log('* serving trails by park id ' + req.params.id);
        res.json(trails);
    });
});

// route for trails by difficulty
router.get('/trails/difficulty/:difficulty', function(req, res) {
    Trail.find({ 'properties.difficulty': req.params.difficulty }, function(err, trails) {
        if (err) { res.send(err); }
        console.log('* serving trails by difficulty ' + req.params.difficulty);
        res.json(trails);
    });
});

// route for trails by name
router.get('/trails/name/:name', function(req, res) {
    Trail.find({ 'properties.name': req.params.name }, function(err, trails) {
        if (err) { res.send(err); }
        console.log('* serving trails by name ' + req.params.name);
        res.json(trails);
    });
});

app.use('/api', router);

app.listen(port);
console.log('======= SERVER STARTED =======');