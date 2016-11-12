var mongooseLib = require('./config/lib/mongoose');
var mongoose = require('mongoose');
var _ = require('lodash');
var fs = require('fs');
var FCM = require('fcm-push');
var Promise = require('bluebird');
var chalk = require('chalk');

// before running instance, check if notifications services is running already.
var appStatus;
try {
  appStatus = require('./.notifications.json');
  if (appStatus.running) {
    console.log(chalk.red('Notification service is already running!. Quitting...'));
    process.exit(0);
  }
} catch (e) {
  // do nothing because .notifications.json doesn't exist and it means, no other notifications instance
  console.log(chalk.green('.notifications.json does not exist. creating a new one.'));
}

appStatus = appStatus || {};
appStatus.running = true;
appStatus.startedAt = new Date().toString();

writeStatus(appStatus, sendNotifications);

function writeStatus(status, callback) {
  var string = JSON.stringify(status, null, '\t');
  fs.writeFile('./.notifications.json', string, function(err) {
    if (err) return console.error(err);
    console.log(chalk.green('Finished writing to status file.'));
    if (callback) return callback();
  });
}

function sendNotifications() {
  mongooseLib.loadModels();
  mongooseLib.connect(function (db) {
    console.log('connected to db');
    var Notification = mongoose.model('Notification');
    Notification.find({
      // createdAt: {
      //   $lte: new Date()
      // },
      // @TODO failed notification should be sent again?
      status: 0 // not sent
    }).populate([{
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
    }]).exec(function(err, notifications) {
      if (err) {
        console.log(err);
        return;
      }

      var promises = [];
      var successCount = 0;
      var errorCount = 0;
      // send android, ios notifications respectively
      _.each(notifications, function(notification) {
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
            promises.push(fcm.send(androidMessage).then(function(response) {
              notification.status = 2;
              console.log(chalk.green('Successfully sent!'));
              console.log(response);
              successCount += 1;
              return notification.save();
            }).catch(function(err) {
              notification.status = 1;
              console.log(chalk.red('Something has gone wrong on sending PN!'));
              console.log(err);
              errorCount += 1;
              return notification.save();
            }));
            break;
          case 'iOS':
            // @TODO
            break;
        }
      });

      Promise.all(promises).then(function() {
        console.log(chalk.green('Sent notifications to ' + successCount + ' users'));
        console.log(chalk.green('Failed sending on ' + errorCount + ' users'));

        // writing status and exiting.
        appStatus.running = false;
        appStatus.endedAt = new Date().toString();
        writeStatus(appStatus, function() {
          console.log(chalk.green('Finished running worker!'));
          process.exit(0);
        });
      });
    });
  });
}
