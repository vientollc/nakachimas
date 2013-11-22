var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dburl = undefined;
var moment = require('moment');

exports.connect = function(url, callback) {
    dburl = url;
    mongoose.connect(dburl);
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}

var PinSchema = mongoose.Schema({
    pin: String,
    company: String,
    narration: String,
    expiry: Date,
    batch: String,
    nafdac: String,
    queries: Number,
    requests: [{date: Date, phone: String}],
    created: Date
});

var PIN = mongoose.model('PIN', PinSchema);

exports.create = function(pin, company, batch, callback){
    var newPin = new PIN();
    newPin.pin = pin;
    newPin.company = company;
    newPin.batch = batch;
    newPin.created = new Date();
    newPin.queries = 0;
    newPin.save(function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null, pin);
        }
    });
}

exports.createFull = function(pin, company, narration, expiry, batch, nafdac, callback) {
    var newPin = new PIN();
    newPin.pin = pin;
    newPin.company = company;
    newPin.created = new Date();
    newPin.queries = 0;
    newPin.narration = narration;
    newPin.expiry = moment(expiry, "DD-MM-YYYY");
    newPin.batch = batch;
    newPin.nafdac = nafdac;
    newPin.save(function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

exports.update = function(pin, narration, expiry, batch, nafdac, callback) {
    exports.read(pin, function(err, doc) {
        if(err) {
            callback(err);
        } else {
            doc.narration = narration;
            doc.expiry = expiry;
            doc.batch = batch;
            doc.nafdac = nafdac;
            doc.save(function(err) {
                if(err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        }
    });
}

exports.enquire = function(pin, phone, callback) {
    exports.read(pin, function(err, doc) {
        if(err) {
            callback(err);
        } else {
            doc.requests.push({
                date: new Date(),
                phone: phone
            });
            doc.queries += 1;
            doc.save(function(err) {
                if(err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        }
    });
}

exports.read = function(pin, callback) {
    PIN.findOne({pin: pin}, function(err, doc) {
        if(err) {
            callback(err, null);
        } else {
            callback(null, doc);
        }
    });
}

exports.pins = function(callback) {
    PIN.find().exec(function(err, docs) {
        if(err) {
            callback(err);
        } else {
            if(docs) {
                callback(null, docs);
            } else {
                callback();
            }
        }
    });
}