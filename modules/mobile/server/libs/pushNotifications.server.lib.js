'use strict';

var chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  AppUser = mongoose.model('AppUser'),
  gcm = require('node-gcm'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  appUserLib = require(path.resolve('./modules/analytics/server/libs/appUser.server.lib'));

mongoose.Promise = Promise;

exports.send = function(application, campaign) {
  // TODO: use segments
  // TODO: check preferences
  console.log('Sending push notifications');

  return appUserLib.getAppUsersBySegment(application, campaign.segment)
  .then(function(appUsers){
    if (campaign.animation) {
      campaign.animation.expiresAt = campaign.animation.duration * campaign.loopCount + (campaign.loopCount - 1) * campaign.loopDelay;
    }

    var msgData = _.pick(campaign, 'animation', '_id', 'platform', 'message', 'messagePosition', 'url', 'campaignType');

    console.log('MSG DATA', msgData);

    var message = new gcm.Message({
      priority: 'high',
      contentAvailable: true,
      // delayWhileIdle: true,
      // timeToLive: 3,
      data: msgData,
      notification: {
        title: 'dyamic push',
        body: 'notification from dynamic push',
        icon: 'ic_launcher'
      }
    });
    console.log(appUsers);
    var registerTokens = [];
    _.each(appUsers, function(u) {
      if (u.userDevice && u.userDevice.gcmToken) {
        registerTokens.push(u.userDevice.gcmToken);
      }
    });
    console.log('Tokens', registerTokens);

    var sender = new gcm.Sender(application.googleApiKey);
    sender.sendNoRetry(message, {registrationTokens: registerTokens}, function(err, response){
      if (err) {
        return Promise.reject(err);
      } else {
        console.log(response);
        return Promise.resolve(response);
      }
    });
  });
};
