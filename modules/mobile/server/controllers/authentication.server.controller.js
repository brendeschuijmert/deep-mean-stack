'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  config = require(path.resolve('./config/config')),
  md5 = require('md5'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash'),
  AppUser = mongoose.model('AppUser'),
  Application = mongoose.model('Application'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Promise = require('bluebird');

mongoose.Promise = Promise;

/**
 * Register App User
 */
exports.authenticate = function (req, res) {
  var uuid = req.body.uuid;
  var newAppUser = new AppUser({
    uuid: uuid
  });
  var currentApplication;

  Application.findOne({
    apiKey: req.body.apiKey,
    apiSecret: req.body.apiSecret
  })
  .lean()
  .exec()
  .then(function(application){
    if (application === null) {
      throw {
        message: 'Application not found'
      };
    }
    currentApplication = application;
    return AppUser.findOne({
      uuid: uuid,
      application: application._id
    });
  })
  .then(function(appUser){
    if (appUser === null) {
      newAppUser.application = currentApplication._id;
      return newAppUser.save();
    } else {
      return Promise.resolve(appUser);
    }
  })
  .then(function(currentAppUser){
    var appJson = _.pick(currentApplication, 'senderId', 'packageName');
    var token = jwt.sign(currentApplication, config.mobileSessionSecret, {
      expiresIn: config.mobileTokenExpire * 60
    });
    res.json({
      success: true,
      application: appJson,
      userId: currentAppUser._id,
      token: token
    });
  }).catch(function(err){
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

// authentication middleware
exports.applicationByToken = function (req, res, next) {
  var token = req.body.mobileToken || req.query.mobileToken || req.headers.Authorization;

  // decode token
  if (token) {
    jwt.verify(token, config.mobileSessionSecret, function(err, decoded){
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token'
        });
      }else {
        req.decoded = decoded;
        next();
      }
    });
  }else {
    return res.status(403).send({
      success: false,
      message: 'No Token Provided'
    });
  }
};
