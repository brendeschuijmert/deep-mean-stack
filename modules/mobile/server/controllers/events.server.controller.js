'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  AnalyticEvent = mongoose.model('AnalyticEvent'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  Promise = require('bluebird'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

mongoose.Promise = Promise;
/**
 * Track User Event
 */
exports.track = function (req, res) {
  var eventData = _.pick(req.body.event, 'eventType', 'eventTarget', 'eventValue');
  var analyticEvent = new AnalyticEvent(eventData);
  var application = req.decoded;
  var userDevice;

  AppUser.findById(req.body.userId)
  .populate('userDevice')
  .then(function(appUser) {
    if (!appUser) {
      throw {
        message: 'App user not found'
      };
    }

    if (req.body.userDevice) { // update user info
      var userDeviceData = _.extend(appUser.userDevice.toObject(), req.body.userDevice);
      userDeviceData = _.omit(userDeviceData, '_id', '__v', 'created');
      userDevice = new UserDevice(userDeviceData);
      userDevice.appUser = appUser._id;
      return userDevice.save();
    } else { // user info is not updated
      userDevice = appUser.userDevice;
      return Promise.resolve(userDevice);
    }
  })
  .then(function(){
    analyticEvent.userDevice = userDevice._id;
    return analyticEvent.save();
  })
  .then(function(){
    res.json(analyticEvent);
  })
  .catch(function(err){
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};
