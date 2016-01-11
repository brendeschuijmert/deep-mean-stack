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
  Application = mongoose.model('Application'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

mongoose.Promise = require('bluebird');

/**
 * Register App User
 */
exports.authenticate = function (req, res) {
  Application.findOne({
    apiKey: req.body.apiKey,
    apiSecret: req.body.apiSecret
  })
  .lean()
  .exec()
  .then(function(application){
    if (application === null) {
      throw {
        errors: {
          not_found: {
            message: 'Application not found'
          }
        }
      };
    }
    console.log(application);
    var appJson = _.pick(application, 'senderId', 'packageName');
    var token = jwt.sign(application, config.apiSessionSecret, {
      expiresIn: config.apiTokenExpire * 60
    });
    res.json({
      success: true,
      application: appJson,
      token: token
    });
  }).catch(function(err){
    console.log(JSON.stringify(err));
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

// authentication middleware
exports.applicationByToken = function (req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    jwt.verify(token, config.apiSessionSecret, function(err, decoded){
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
