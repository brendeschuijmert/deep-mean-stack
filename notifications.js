var mongooseLib = require('./config/lib/mongoose');
var mongoose = require('mongoose');
var _ = require('lodash');
var FCM = require('fcm-push');

mongooseLib.loadModels();
mongooseLib.connect(function (db) {
  var Notification = mongoose.model('Notification');
  Notification.find({
    createdAt: {
      $lte: new Date()
    },
    status: 0 // not sent
  }).populate([{
    path: 'appUser',
    populate: {
      path: 'userDevice'
    }
  }, {
    path: 'campaign',
    populate: [
      { path: 'application' },
      { path: 'animation' }
    ]
  }]).exec(function(err, notifications) {
    // send android, ios notifications respectively
    _.each(notifications, function(notification) {
      var campaign = notification.campaign;
      if (campaign.animation) {
        campaign.animation.expiresAt = campaign.animation.duration * campaign.loopCount + (campaign.loopCount - 1) * campaign.loopDelay;
      }
      var fcm = FCM(campaign.application.fcmServerKey);
      var msgData = _.pick(campaign, 'animation', 'platform', 'message', 'messagePosition', 'url', 'campaignType');
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
          fcm.send(androidMessage, function(err, response) {
            if(err) {
              notification.status = 1;
              notification.save();
              console.log('Something has gone wrong !');
            } else {
              notification.status = 2;
              notification.save();
              console.log('Successfully sent!', response);
            }
          });
          break;
        case 'iOS':
          // @TODO
          break;
      }
    });
  });
});
