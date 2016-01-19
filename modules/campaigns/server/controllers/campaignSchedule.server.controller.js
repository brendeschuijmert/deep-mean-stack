'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  CampaignSchedule = mongoose.model('CampaignSchedule'),
  scheduler = require('../libs/scheduler.server.lib'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * saves campaign schedule
 */
exports.save = function (req, res) {
  var jsonObj = _.pick(req.body, 'repeat', 'sendDate', 'timeZone', 'status', 'frequency');
  var campaignSchedule;
  if (req.campaign.deliverySchedule) {
    campaignSchedule = _.extend(req.campaign.deliverySchedule, jsonObj);
  } else {
    campaignSchedule = new CampaignSchedule(jsonObj);
    campaignSchedule.campaign = req.campaign._id;
  }
  campaignSchedule.nextSend = scheduler.getNextSchedule(campaignSchedule);

  campaignSchedule.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(campaignSchedule);
    }
  });
};

/**
 * Delete schedule associated to campaign
 */
exports.delete = function (req, res) {
  if (req.campaign.deliverySchedule) {
    req.campaign.deliverySchedule.remove(function(err){
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        delete req.campaign.deliverySchedule;
        req.campaign.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json({ success: true });
          }
        });
      }
    });
  }
};
