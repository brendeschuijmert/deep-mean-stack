'use strict';

/**
 * Module dependencies.
 */
var auth = require('../controllers/authentication.server.controller'),
  gcm = require('../controllers/gcm.server.controller');

module.exports = function (app) {
  // Applications collection routes
  app.route('/api/mobile/authenticate')
    .post(auth.authenticate);

  app.route('/api/mobile/subscribe')
    .post(auth.applicationByToken, gcm.register);
};
