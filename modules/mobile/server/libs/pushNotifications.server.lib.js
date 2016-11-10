'use strict';

var chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose'),
  PNotification = mongoose.model('Notification'),
  config = require(path.resolve('./config/config')),
  _ = require('lodash'),
  Promise = require('bluebird'),
  appUserLib = require(path.resolve('./modules/analytics/server/libs/appUser.server.lib'));

mongoose.Promise = Promise;

exports.send = function(application, campaign) {
  // TODO: check preferences
  console.log('Storing notifications into queue');

  return appUserLib.getAppUsersBySegment(application, campaign.segment)
  .then(function(appUsers){
    _.each(appUsers, function(user) {
      var notification = new PNotification();
      notification.campaign = campaign;
      notification.appUser = user;
      notification.save(function(err){
        if (err) {
          console.log(err);
        }
      });
    });
  });
};
