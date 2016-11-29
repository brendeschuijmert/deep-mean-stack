'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  moment = require('moment'),
  Application = mongoose.model('Application'),
  UserDevice = mongoose.model('UserDevice'),
  AppUser = mongoose.model('AppUser'),
  Segment = mongoose.model('Segment'),
  AnalyticEvent = mongoose.model('AnalyticEvent'),
  CustomEventModel = mongoose.model('CustomEvent'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.getEventsAnalyticsBySegment = function(req, res) {
  var segmentId = req.query.segmentId;
  var eventId = req.query.eventId;
  var startDate = req.query.startDate || '1980-01-01';
  var endDate = req.query.endDate || new Date();
  var groupBy = req.query.groupBy;

  var groupMap = {
    day: {
      _id: { year: { $year: '$created' }, month: { $month: '$created' }, day: { $dayOfMonth: '$created' } },
      count: { $sum: 1 }
    },
    month: {
      _id: { year: { $year: '$created' }, month: { $month: '$created' } },
      count: { $sum: 1 }
    },
    year: {
      _id: { year: { $year: '$created' } },
      count: { $sum: 1 }
    }
  };

  var segmentPromise = Promise.resolve({ _id: 'all', filter: { body: '{}' } });
  if (segmentId) {
    segmentPromise = Segment.findById(segmentId).populate('filter').exec();
  }

  var eventPromise = Promise.resolve({ eventTarget: '', eventType: '', eventValue: '' });
  if (eventId) {
    eventPromise = CustomEventModel.findById(eventId).exec();
  }

  var userPromise = AppUser.find({ application: req.application._id }).select('_id').exec();

  var segment;
  var customEvent;
  var userIds;

  Promise.all([segmentPromise, eventPromise, userPromise])
  .then(function(result) {
    segment = result[0];
    customEvent = result[1];
    userIds = _.map(result[2], '_id');

    var filter = segment.filter && segment.filter.body ? JSON.parse(segment.filter.body) : {};

    var deviceConditions = _.extend({
      appUser: { $in: userIds }
    }, filter);
    return UserDevice.find(deviceConditions).select('_id');
  })
  .then(function(devices) {
    var deviceIds = _.map(devices, '_id');
    var eventFilter = {
      eventTarget: customEvent.eventTarget || '',
      eventType: customEvent.eventType || '',
      eventValue: customEvent.eventValue || '',
      created: {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate()
      },
      userDevice: { $in: deviceIds }
    };

    if (!eventFilter.eventTarget) delete eventFilter.eventTarget;
    if (!eventFilter.eventType) delete eventFilter.eventType;
    if (!eventFilter.eventValue) delete eventFilter.eventValue;

    return AnalyticEvent.aggregate({
      $match: eventFilter
    }, {
      $group: groupMap[req.query.groupBy] || groupMap.day
    });
  })
  .then(function(result) {
    res.json(result);
  })
  .catch(function(err) {
    res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};
