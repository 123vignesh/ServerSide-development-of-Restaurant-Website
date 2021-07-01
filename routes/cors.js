var express = require('express');
var cors = require('cors')

var app = express()

var whiteList = ['http://localhost:3000', 'https://localhost:3443', 'http://:3001']


var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if (whiteList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};


exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);