'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

mongoose.Promise = require('bluebird');

/**
 * Register App User
 */
exports.register = function (req, res) {
  // var appUser = new AppUser();
  // var userDevice = new UserDevice(req.body);
  var application = req.decoded;
  console.log(application);
  res.json(application);
  return;

  // // saving app user
  // appUser.save().then(function(){
  //   userDevice.appUser = appUser;
  //
  //   // now saving user device
  //   return userDevice.save();
  // }).then(function(){
  //   appUser.userDevice = userDevice;
  //
  //   // link user device for app user
  //   return appUser.save();
  // }).then(function(){
  //   res.json(appUser);
  // }).catch(function(err){
  //   res.status(400).send({
  //     message: errorHandler.getErrorMessage(err);
  //   });
  // });
};
