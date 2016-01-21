'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  crontab = require('node-crontab'),
  _ = require('lodash'),
  chalk = require('chalk'),
  CampaignSchedule = mongoose.model('CampaignSchedule'),
  scheduler = require('../libs/scheduler.server.lib'),
  pushNotificationsLib = require(path.resolve('./modules/mobile/server/libs/pushNotifications.server.lib')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * saves campaign schedule
 */
exports.save = function (req, res) {
  var jsonObj = _.pick(req.body, 'repeat', 'sendDate', 'timeZone', 'status', 'frequency');
  var campaignSchedule;
  if (req.campaign.deliverySchedule) {
    campaignSchedule = _.extend(req.campaign.deliverySchedule, jsonObj);
    if (campaignSchedule.jobId) {
      try {
        crontab.cancelJob(campaignSchedule.jobId);
      } catch(e) {
        console.log(chalk.bold.red('Crontab: job id not found'));
      }
    }
  } else {
    campaignSchedule = new CampaignSchedule(jsonObj);
    campaignSchedule.campaign = req.campaign._id;
  }

  // scheduling job with crontab
  var jobId;
  if (campaignSchedule.frequency === 'immediate') {
    jobId = crontab.scheduleJob('* * * * *', pushNotificationsLib.send, [req.campaign], null, false);
  } else { // scheduled jobs
    jobId = crontab.scheduleJob(scheduler.getCrontabString(jsonObj), pushNotificationsLib.send, [req.campaign]);
  }
  campaignSchedule.jobId = jobId;

  campaignSchedule.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!req.campaign.deliverySchedule) {
        req.campaign.deliverySchedule = campaignSchedule._id;
        req.campaign.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json(campaignSchedule);
          }
        });
      } else {
        res.json(campaignSchedule);
      }
    }
  });
};

/**
 * Delete schedule associated to campaign
 */
exports.delete = function (req, res) {
  var campaignSchedule = req.campaign.deliverySchedule;
  if (campaignSchedule) {
    // unschedule if any job is scheduled
    if (campaignSchedule.jobId) {
      try {
        crontab.cancelJob(campaignSchedule.jobId);
      } catch(e) {
        console.log(chalk.bold.red('Crontab: job id not found'));
      }
    }

    campaignSchedule.remove(function(err){
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
