'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  multer = require('multer'),
  moment = require('moment'),
  Application = mongoose.model('Application'),
  Campaign = mongoose.model('Campaign'),
  config = require(path.resolve('./config/config')),
  scheduler = require('../libs/scheduler.server.lib'),
  ImageLib = require(path.resolve('./modules/core/server/libs/images.server.lib')),
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
 * Uploads animation
 */
exports.uploadImage = function (req, res) {
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, config.uploads.dest);
    },
    filename: function(req, file, cb) {
      cb(null, randomstring.generate(10) + '_' + file.originalname);
    }
  });
  var upload = multer(_.extend(config.uploads, {
    storage: storage
  })).single('image');
  var campaign = req.campaign;
  upload(req, res, function(uploadError) {
    if(uploadError) {
      return res.status(400).send({
        message: 'Error occurred while uploading picture'
      });
    } else {
      fs.chmodSync(req.file.path, '0777');
      ImageLib.uploadToAWS(req.file, function(err, image) {
        fs.unlinkSync(req.file.path);
        if (err) {
          return res.status(400).send({
            message: err
          });
        }

        if (image) {
          // @TODO FIX below. animation is Image object and image is url
          campaign.animation = image;
          campaign.save(function (err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(campaign);
            }
          });
        }
      });
    }
  });
};

/**
 * Update a campaign
 */
exports.update = function (req, res) {
  var campaign = req.campaign;
  var promise = Promise.resolve();

  if ((req.body.hasOwnProperty('isPaused') && req.body.isPaused !== campaign.isPaused) ||
    (req.body.hasOwnProperty('isActive') && req.body.isActive !== campaign.isActive)
  ){
    if ((req.body.isPaused || !req.body.isActive) && campaign.deliverySchedule) {
      console.log('cancelling notifications');
      // if campaign become paused or inactive, cancel scheduled job
      scheduler.cancelJob(campaign.deliverySchedule);
      campaign.deliverySchedule.jobId = '';
      promise = campaign.deliverySchedule.save();
    } else if (!req.body.isPaused && req.body.isActive) {
      // if campaign becomes active and unpaused, schedule notifications
      console.log('scheduling notifications');
      promise = scheduler.scheduleNotifications(req.campaign, req.application, true);
    }
  } else if (req.body.expiresAt && moment().diff(req.body.expiresAt) > 0 && campaign.deliverySchedule) {
    // or if campaign is expired, cancel job
    console.log('job has expired. cancelling job');
    scheduler.cancelJob(campaign.deliverySchedule);
    campaign.deliverySchedule.jobId = '';
    promise = campaign.deliverySchedule.save();
  }


  campaign = _.extend(
    campaign,
    _.pick(req.body, 'isPaused', 'isActive', 'message', 'messagePosition', 'expiresAt', 'deliveryAction', 'tags', 'title', 'platform', 'loopCount', 'loopDelay', 'url', 'campaignType', 'segment')
  );

  promise.then(function() {
    return campaign.save();
  }).then(function() {
    res.json(campaign);
  }).catch(function(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
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

  Campaign.findById(id).populate('deliverySchedule').populate('animation').exec(function (err, campaign) {
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
