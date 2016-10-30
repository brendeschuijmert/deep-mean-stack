'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Applications Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/applications/:applicationId/segments',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/segments/:segmentId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/applications/:applicationId/segments',
      permissions: '*'
    }, {
      resources: '/api/applications/:applicationId/segments/:segmentId',
      permissions: '*'
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/applications/:applicationId/segments',
      permissions: []
    }, {
      resources: '/api/applications/:applicationId/segments/:segmentId',
      permissions: []
    }]
  }]);
};

/**
 * Check If Applications Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an application is being processed and the current user created it then allow any manipulation
  if (req.application && req.segment && req.user && req.application.user && req.application.user._id === req.user._id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
