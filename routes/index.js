var pin = require('../modules/pin');
var url = require('url');
var querystring = require('querystring');
var jsonxml = require('jsontoxml');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.adminlogin = function(req, res) {
    res.render('adminlogin');
}

exports.admin = function(req, res) {
    res.render('admin');
};

exports.validate = function(req, res) {
    var sourceaddr = querystring.parse(url.parse(req.url).query).SOURCEADDR;
    var destaddr = querystring.parse(url.parse(req.url).query).DESTADDR;
    var message = querystring.parse(url.parse(req.url).query).MESSAGE;
    
    var parts = message.split(' '); console.log(parts);
    
    if((parts[0].toLowerCase() == 'mas') && (parts.length == 2)) {
        pin.validate(parts[1], sourceaddr, res);
    } else {
        res.send('Invalid Message Format. Send "mas pin" to validate a PIN. Thanks for using Universal Authentication');
    }
}

exports.usvalidate = function(req, res) {
    var phone = querystring.parse(url.parse(req.url).query).From;
    var msg = querystring.parse(url.parse(req.url).query).Body;
    
    console.log(msg);
    pin.usvalidate(msg, phone, res);
    
}

exports.generate = function(req, res) {
    var count = req.body.Count; console.log(count);
    var company = req.body.Company; console.log(company);
    
    pin.generate(count, company, res);
}