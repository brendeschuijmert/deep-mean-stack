'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  Segment = mongoose.model('Segment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a segment
 */
exports.create = function (req, res) {
  var segmentJSON = _.pick(req.body, 'name', 'filter');
  var segment = new Segment(segmentJSON);
  segment.application = segment.application;

  segment.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(segment);
    }
  });
};

/**
 * Show the current segment
 */
exports.read = function (req, res) {
  res.json(req.segment);
};

/**
 * Update a segment
 */
exports.update = function (req, res) {
  var segment = req.segment;

  segment = _.extend(
    segment,
    _.pick(req.body, 'name', 'filter')
  );

  segment.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(segment);
    }
  });
};

/**
 * Delete an segment
 */
exports.delete = function (req, res) {
  var segment = req.segment;

  segment.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(segment);
    }
  });
};

/**
 * List of Segments
 */
exports.list = function (req, res) {
  //TODO: support for UAC
  Segment.find().sort('-created').exec(function (err, segments) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(segments);
    }
  });
};

/**
 * Segment middleware
 */
exports.segmentByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Segment is invalid'
    });
  }

  Segment.findById(id).exec(function (err, segment) {
    if (err) {
      return next(err);
    } else if (!segment) {
      return res.status(404).send({
        message: 'No segment with that identifier has been found'
      });
    }
    req.segment = segment;
    next();
  });
};
