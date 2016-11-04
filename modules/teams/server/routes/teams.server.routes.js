'use strict';

/**
 * Module dependencies.
 */
var teamPolicy = require('../policies/team.server.policy'),
  team = require('../controllers/teams.server.controller');

module.exports = function (app) {

  // Users collection routes
  app.route('/api/teams')
    .get(teamPolicy.isAllowed, team.list)
    .post(teamPolicy.isAllowed, team.validateMemberIdsField, team.validateAccessField, team.create);

  // Single user routes
  app.route('/api/teams/:teamId')
    .get(teamPolicy.isAllowed, team.validateOwner, team.read)
    .put(teamPolicy.isAllowed, team.validateOwner, team.validateMemberIdsField, team.validateAccessField, team.update)
    .delete(teamPolicy.isAllowed, team.validateOwner, team.delete);

  // Finish by binding the user middleware
  app.param('teamId', team.teamByID);
};
