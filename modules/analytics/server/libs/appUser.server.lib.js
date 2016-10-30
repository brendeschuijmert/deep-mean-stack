'use strict';

var mongoose = require('mongoose'),
  AppUser = mongoose.model('AppUser'),
  Segment = mongoose.model('Segment'),
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
    } else {
      Segment.findById(segment).populate('filter').then(function(result) {
        return AppUser.find({ application: application }).populate({
          path: 'userDevice',
          match: result.filter.body
        }).exec(function(err, appUsers) {
          if (err) {
            reject(err);
          } else {
            resolve(appUsers);
          }
        });
      }).catch(function(err) {
        reject(err);
      });
    }
  });
};
