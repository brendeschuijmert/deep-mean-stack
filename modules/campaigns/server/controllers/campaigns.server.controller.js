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
  Application = mongoose.model('Application'),
  Campaign = mongoose.model('Campaign'),
  Uploader = require('s3-uploader'),
  config = require(path.resolve('./config/config')),
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
        if (err) {
          return res.status(400).send({
            message: err
          });
        }

        if (image) {
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
