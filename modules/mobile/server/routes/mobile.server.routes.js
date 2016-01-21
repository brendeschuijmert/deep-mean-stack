'use strict';

/**
 * Module dependencies.
 */
var auth = require('../controllers/authentication.server.controller'),
  appUserCtlr = require('../controllers/appUser.server.controller'),
  events = require('../controllers/events.server.controller');

module.exports = function (app) {
  // Applications collection routes
  app.route('/api/mobile/authenticate')
    .post(auth.authenticate);

  app.route('/api/mobile/user/:appUserId')
    .post(auth.applicationByToken, appUserCtlr.update);

  app.route('/api/mobile/user/:appUserId/track_event')
    .post(auth.applicationByToken, events.track);

  // Finish by binding the application middleware
  app.param('appUserId', appUserCtlr.appUserById);
};
