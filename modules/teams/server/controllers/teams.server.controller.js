'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
   _ = require('lodash'),
  User = mongoose.model('User'),
  Team = mongoose.model('Team'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Returns a Team
 */
exports.read = function (req, res) {
  res.json(req.team);
};

/**
 * Create a Team
 */
exports.create = function (req, res) {

    // Init Variables
  var inputs = _.pick(req.body, 'name');
  var member_ids = req.body.member_ids;

  var team = new Team(inputs);
  team.owner = req.user;

  User.find({
    '_id': { $in: member_ids},
    'parent': req.user
  }, function(err, members) {
    members = members || [];
    if (member_ids.length != members.length) {
      return res.status(400).send({
        message: 'Member ids are incorrect. Make sure they are valid and you have the access to them.'
      });
    }
    team.members = members;
    team.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err),
          errors: errorHandler.getFieldErrors(err)
        });
      } else {
        res.json(team);
      }
    });
  });
};

/**
 * Update a Team
 */
exports.update = function (req, res) {
  var team = req.team;

  //For security purposes only merge these parameters
  team.name = req.body.name;
  
  var member_ids = req.body.member_ids;
  User.find({
    '_id': { $in: member_ids},
    'parent': req.user
  }, function(err, members) {
    members = members || [];
    if (member_ids.length != members.length) {
      return res.status(400).send({
        message: 'Member ids are incorrect. Make sure they are valid and you have the access to them.'
      });
    }
    team.members = members;
    team.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err),
          errors: errorHandler.getFieldErrors(err)
        });
      } else {
        res.json(team);
      }
    });
  });
};

/**
 * Delete a Team
 */
exports.delete = function (req, res) {
  var team = req.team;

  team.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(team);
  });
};

/**
 * List of Teams
 */
exports.list = function (req, res) {
  Team.find({ owner: req.user }).sort('name').exec(function (err, teams) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(teams);
  });
};

/**
 * Team middleware
 */
exports.teamByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Team is invalid'
    });
  }

  Team.findById(id, '-salt -password').exec(function (err, team) {
    if (err) {
      return next(err);
    } else if (!team) {
      return next(new Error('Failed to load team ' + id));
    }

    req.team = team;
    next();
  });
};

/**
 * Filter middleware
 */
exports.validateOwner = function (req, res, next) {
  var team = req.team;

  if (!team.owner || !team.owner.equals(req.user._id)) {
    return res.status(403).send({
      message: 'Authorization error, you can not access this team.'
    });
  }

  next();
};
