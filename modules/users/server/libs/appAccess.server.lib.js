'use strict';

var mongoose = require('mongoose'),
  Team = mongoose.model('Team'),
  _ = require('lodash'),
  Promise = require('bluebird');

mongoose.Promise = Promise;

exports.getAppAccess = function(application, resource, user) {
  return new Promise(function(resolve, reject){
    if (!application || !user) {
      reject(new Error('Inputs are required'));
    } else {
      if (application.user.equals(user._id)) {
        // Cool, the user has full Access to the app (owner)
        resolve(true);
      } else {
        if (!user.team) {
          // Not allowed because the user is not in any team.
          resolve(false);
        } else {
          Team.findById(user.team).populate('access').exec(function (err, team) {
            if (err) {
              reject(err);
            } else {
              var access = _.find(team.access, { resource: resource, application: application._id });
              if (access) {
                // Access is allowed
                resolve(true);
              } else {
                // Access is NOT allowed
                resolve(false);
              }
            }
          });
        }
      }
    }
  });
};
