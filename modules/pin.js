var moment = require('moment');
var PIN = require('../models/pins');
var jsonxml = require('jsontoxml');
var sys = require('util');
var fs = require('fs');
var rest = require('restler');

PIN.connect('mongodb://johnthas:Odd3seyus@ds045057.mongolab.com:45057/viento');


exports.validate = function(pin, phone, res){
    PIN.read(pin, function(err, doc) {
        if(err) {
            res.send('PIN NOT RECOGNIZED. Please try again. Questions? Call 080x xxx xxxx');
        } else {
            if(doc) {
                //pin exists. check expiry
                var expiry = doc.expiry;
                if(moment().isBefore(expiry)){
                    var queries = doc.queries;
                    doc.requests.push({
                        date: new Date(),
                        phone: phone
                    });
                    doc.queries += 1;
                    doc.save(function(err) {
                        if(err) {
                            console.log(err);
                            res.send('Error.');
                        } else {
                            res.send('OK AUTHENTIC ' + doc.narration + ' NRN: ' + doc.nafdac + ' B.No. ' + doc.batch + ' EXP. ' + moment(expiry).format("DD-MM-YYYY") + ' PIN used ' +  doc.queries + ' times. Questions? Call 080x xxx xxxx. Powered by Universal Authentication');
                        }
                    });
                } else {
                    res.send('WARNING. This is an expired medicine pack. Please call 080x xxx xxxx for further assistance.');
                }
            } else {
                res.send('PIN NOT RECOGNIZED. Please try again. Questions? Call 080x xxx xxxx');
            }
            
            
            
        }
    });
}

exports.usvalidate = function(pin, phone, res){
    PIN.read(pin, function(err, doc) {
        if(err) {
            var xml = twiResp('PIN NOT RECOGNIZED. Please try again. Questions? Call 080x xxx xxxx');
            res.send(xml);
        } else {
            if(doc) {
                //pin exists. check expiry
                var expiry = doc.expiry;
                if(moment().isBefore(expiry)){
                    var queries = doc.queries;
                    doc.requests.push({
                        date: new Date(),
                        phone: phone
                    });
                    doc.queries += 1;
                    doc.save(function(err) {
                        if(err) {
                            console.log(err);
                            var xml = twiResp('Unable to process request at this time. Please try again later. Thanks for using Universal Authentication.');
                            res.send(xml);
                        } else {
                            var xml = twiResp('OK AUTHENTIC ' + doc.narration + ' NRN: ' + doc.nafdac + ' B.No. ' + doc.batch + ' EXP. ' + moment(expiry).format("DD-MM-YYYY") + ' PIN used ' +  doc.queries + ' times. Questions? Call 080x xxx xxxx. Powered by Universal Authentication');
                            res.send(xml);
                        }
                    });
                } else {
                    var xml = twiResp('WARNING. This is an expired medicine pack. Please call 080x xxx xxxx for further assistance.');
                    res.send(xml);
                }
            } else {
                var xml = twiResp('PIN NOT RECOGNIZED. Please try again. Questions? Call 080x xxx xxxx');
                res.send(xml);
            }
            
            
            
        }
    });
}

function twiResp(sms) {
    var obj = {
        Response: {
            Sms: sms
        }
    };
    
    var xml = jsonxml(obj);
    return xml;
}

exports.generate = function(count, company, res) {
    console.log('generating %s pins', count);
    var batch = moment().format('MMDDYYYYHHmmss');
    var pins = [];
    var pinTable = {
        table: []
    };
    var pins2 = [];
    pinTable.table.push({
        tr: [
            {td: 'PIN'},
            {td: 'Company'},
            {td: 'Narration'},
            {td: 'Expiry'},
            {td: 'Batch'},
            {td: 'NAFDAC'}
        ]
    });
    
    while( pins.length < count) {
        var pin = '';
        for(var j=0; j < 16; j++) {
            pin += Math.floor(Math.random() * 10);
        }
        console.log(pin);
        pins.push(pin);
    }
    
    //check database for existense of same pin
    for(var i=0; i<pins.length; i++) {
        PIN.create(pins[i], company, batch, function(err, p) {
            if(err) {
                //do nothing 
                console.log('error creating PIN in database');
                console.log(err.message);
            } else {
                pins2.push(p); console.log(p);
                pinTable.table.push({
                    tr: [
                        {td: p},
                        {td: company},
                        {td: ''},
                        {td: ''},
                        {td: batch},
                        {td: ''}
                    ]
                }); 
                
                if(pins2.length == count) {
                    console.log(pinTable);
                    var xml = jsonxml(pinTable);
                    console.log(xml);
                    rest.postJson('http://docraptor.com/docs', {
                        user_credentials: 'kV3J11cLziImLTyUoO',
                        doc: {
                            document_content: xml,
                            name: batch + '.xls',
                            document_type: 'xls',
                            test: true,
                            tag: 'Nakachi'
                        }
                    }).on('success', function(data, response) {
                        console.log('success creating document');
                        //res.writeHead(200, {'Content-Type': 'application/vnd.ms-excel'});
                        res.write(response.raw);
                        res.end();
                    }).on('fail', function(data, response) {
                        console.log('Failure creating Document');
                        console.log(data);
                    }).on('error', function(err, response) {
                        console.log('Error Creating Document');
                        console.log(err);
                    });
                } else {
                    //need to generate more
                    console.log('insufficient pins. need to generate more');
                }
            }
        });
    }
}

function checksum(s)
{
  var i;
  var chk = 0x8;

  for (i = 0; i < s.length; i++) {
    chk += (s.charCodeAt(i) * i);
  }

  return chk;
}