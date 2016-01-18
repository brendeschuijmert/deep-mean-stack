'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  Application = mongoose.model('Application'),
  Campaign = mongoose.model('Campaign'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a campaign
 */
exports.create = function (req, res) {
  var campaignJson = _.pick(req.body, 'title', 'tags', 'platform');
  var campaign = new Campaign(campaignJson);
  campaign.application = req.application;

  campaign.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(campaign);
    }
  });
};

/**
 * Show the current campaign
 */
exports.read = function (req, res) {
  res.json(req.campaign);
};

/**
 * Update a campaign
 */
exports.update = function (req, res) {
  var campaign = req.campaign;

  //TODO: Support for image
  //TODO: support for segment
  campaign = _.extend(
    campaign,
    _.pick(req.body, 'isPaused', 'isActive', 'message', 'messagePosition', 'expiresAt', 'deliveryAction', 'tags', 'title', 'platform', 'loopCount', 'loopDelay', 'url', 'campaignType')
  );

  campaign.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(campaign);
    }
  });
};

/**
 * Delete an campaign
 */
exports.delete = function (req, res) {
  var campaign = req.campaign;

  campaign.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(campaign);
    }
  });
};

/**
 * List of Campaigns
 */
exports.list = function (req, res) {
  //TODO: support for UAC
  Campaign.find().populate({
    path: 'application',
    match: {
      _id: req.application._id
    }
  }).sort('-created').exec(function (err, campaigns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(campaigns);
    }
  });
};

/**
 * Campaign middleware
 */
exports.campaignByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Application is invalid'
    });
  }

  Campaign.findById(id).populate('deliverySchedule').exec(function (err, campaign) {
    if (err) {
      return next(err);
    } else if (!campaign) {
      return res.status(404).send({
        message: 'No campaign with that identifier has been found'
      });
    }
    req.campaign = campaign;
    next();
  });
};
