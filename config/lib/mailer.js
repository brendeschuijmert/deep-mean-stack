'use strict';

var nodemailer = require('nodemailer');
var config = require('../config');
var Promise = require('bluebird');

var transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

exports.sendMail = function(params) { // to, subject, text
  params.from = params.from || config.email.from;
  return new Promise(function(resolve, reject) {
    transporter.sendMail(params, function(err, info) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
};
