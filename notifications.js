var mongooseLib = require('./config/lib/mongoose');
var mongoose = require('mongoose');
var _ = require('lodash');
var fs = require('fs');
var FCM = require('fcm-push');
var Promise = require('bluebird');
var chalk = require('chalk');
var config = require('./config/config');
var resque = require('coffee-resque').connect(config.redis);

mongooseLib.loadModels();
mongooseLib.connect(function (db) {
  console.log('connected to db');
});

var resqueJobs = {
  send: function(notificationId, callback) {
    var Notification = mongoose.model('Notification');
    Notification.findById(notificationId)
    .populate([{
      path: 'appUser',
      populate: [{
        path: 'userDevice'
      }]
    }, {
      path: 'campaign',
      populate: [
        { path: 'application' },
        { path: 'animation' }
      ]
    }]).exec()
    .then(function(notification) {
      if (!notification) {
        console.log(notification, notificationId);
        throw new Error('Notification not found');
      }

      var campaign = notification.campaign;
      if (campaign.animation) {
        campaign.animation.expiresAt = campaign.animation.duration * campaign.loopCount + (campaign.loopCount - 1) * campaign.loopDelay;
      }
      var fcm = new FCM(campaign.application.fcmServerKey);
      var msgData = _.pick(campaign, 'animation', 'message', 'messagePosition', 'url', 'campaignType');

      // supplying display type (nova, supernova, dpi...)
      var platformIndex = _.findIndex(campaign.platform, { name: notification.appUser.userDevice.devicePlatform });
      if (platformIndex > -1) {
        msgData.displayType = campaign.platform[platformIndex].displayType;
      }

      var androidMessage = {
        to: notification.appUser.userDevice.deviceToken,
        collapse_key: notification.campaign._id, // we use campagin id as collapse key
        // priority: 'high',
        // contentAvailable: true,
        // delayWhileIdle: true,
        // timeToLive: 3,
        data: msgData,
        notification: {
          title: 'dyamic push',
          body: 'notification from dynamic push',
          icon: 'ic_launcher'
        }
      };

      switch (notification.appUser.userDevice.devicePlatform) {
        case 'Android':
          console.log('sending', JSON.stringify(androidMessage));
          return fcm.send(androidMessage).then(function(response) {
            notification.status = 2;
            console.log(chalk.green('Successfully sent!'));
            console.log(response);
            return notification.save();
          }).catch(function(err) {
            notification.status = 1;
            console.log(chalk.red('Something has gone wrong on sending PN!'));
            console.log(err);
            return notification.save();
          });
          break;
        case 'iOS':
          // @TODO
          break;
      }
    })
    .then(function() {
      callback('success!');
    })
    .catch(function(err) {
      callback(err);
    });
  }
};

// setup a worker
var worker = resque.worker('push_notifications', resqueJobs);

// some global event listeners
//
// Triggered every time the Worker polls.
worker.on('poll', function(worker, queue) {
});

// Triggered before a Job is attempted.
worker.on('job', function(worker, queue, job) {
  console.log(chalk.green('a job is going to run'));
});

// Triggered every time a Job errors.
worker.on('error', function(err, worker, queue, job) {
  console.log(chalk.red('There was problem sending a push notification'));
  console.log(err);
});

// Triggered on every successful Job run.
worker.on('success', function(worker, queue, job, result) {
  console.log(chalk.green('Push notification has been sent'));
});

worker.start();
