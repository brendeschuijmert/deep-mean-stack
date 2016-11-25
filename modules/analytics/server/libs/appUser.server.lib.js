'use strict';

var mongoose = require('mongoose'),
  AppUser = mongoose.model('AppUser'),
  Segment = mongoose.model('Segment'),
  _ = require('lodash'),
  Promise = require('bluebird');

mongoose.Promise = Promise;

exports.getAppUsersBySegment = function(application, segmentId, offset, limit) {
  offset = offset*1 || 0;

  return new Promise(function(resolve, reject){
    var promise = Promise.resolve();
    if (segmentId) {
      promise = Segment.findById(segmentId).populate('filter').exec();
    }

    promise.then(function(segment) {
      var match = segment ? JSON.parse(segment.filter.body) : {};
      var query = AppUser.find({ application: application._id, userDevice: { $exists: true } }).populate({
        path: 'userDevice',
        match: match
      }).skip(offset);
      if (limit) {
        query = query.limit(limit * 1);
      }

      return query.exec();
    }).then(function(appUsers) {
      resolve(appUsers);
    }).catch(function(err) {
      reject(err);
    });
  });
};
