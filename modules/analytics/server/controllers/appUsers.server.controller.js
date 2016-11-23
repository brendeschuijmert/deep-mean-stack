'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  Segment = mongoose.model('Segment'),
  appUserLib = require('../libs/appUser.server.lib'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * getAudiences
 */
exports.getAudiences = function(req, res) {
  appUserLib.getAppUsersBySegment(req.application, req.query.segmentId, req.query.offset, req.query.limit || 20)
  .then(function(result) {
    res.json(_.map(result, function(u) {
      return _.omit(u.toObject(), 'verifyDevice', 'verifyMethod', 'verifyToken'); // remove sensitive information
    }));
  })
  .catch(function(err) {
    console.log(err);
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

// @TODO generate CSV and make it available in report section
