'use strict';

var mongoose = require('mongoose'),
  AppUser = mongoose.model('AppUser'),
  _ = require('lodash'),
  Promise = require('bluebird');

mongoose.Promise = Promise;

exports.getAppUsersBySegment = function(application, segment) {
  return new Promise(function(resolve, reject){
    if (!segment) {
      AppUser.find({ application: application }).populate('userDevice').exec(function(err, appUsers){
        if (err) {
          reject(err);
        } else {
          resolve(appUsers);
        }
      });
    }
  });
};
