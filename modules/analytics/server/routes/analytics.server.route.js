'use strict';

/**
 * Module dependencies.
 */
var devices = require('../controllers/devices.server.controller');
var appUsers = require('../controllers/appUsers.server.controller');

// @TODO authorize routes

module.exports = function (app) {
  app.route('/api/applications/:applicationId/analytics/devicesByPlatform')
    .get(devices.getDevicesByPlatform);

  app.route('/api/applications/:applicationId/analytics/getAudiences')
    .get(appUsers.getAudiences);
};
