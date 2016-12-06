'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  randomstring = require('randomstring'),
  _ = require('lodash'),
  fs = require('fs'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Application = mongoose.model('Application'),
  ImageLib = require(path.resolve('./modules/core/server/libs/images.server.lib')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a application
 */
exports.create = function (req, res) {
  var appJson = _.pick(req.body, 'packageName', 'appName', 'fcmServerKey', 'senderId');
  var application = new Application(appJson);
  application.apiSecret = randomstring.generate(20);
  application.apiKey = randomstring.generate(20);
  application.user = req.user;

  application.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(application);
    }
  });
};

/**
 * Show the current application
 */
exports.read = function (req, res) {
  res.json(req.application);
};

/**
 * Update a application
 */
exports.update = function (req, res) {
  var application = req.application;

  //TODO: Support for image
  application = _.extend(
    application,
    _.pick(req.body, 'fcmServerKey', 'apiKey', 'apiSecret', 'packageName', 'senderId', 'appName')
  );

  application.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(application);
    }
  });
};

/**
 * Delete an application
 */
exports.delete = function (req, res) {
  var application = req.application;

  application.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(application);
    }
  });
};

/**
 * List of Applications
 */
exports.list = function (req, res) {
  Application.find({
    user: req.user.role === 'USER' ? req.user.parent : req.user
  }).populate('image').sort('-created').exec(function (err, applications) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(applications);
    }
  });
};

/**
 * upload pem file for iOS PN
 */
exports.uploadPem = function(req, res) {
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, config.uploads.dest);
    },
    filename: function(req, file, cb) {
      cb(null, randomstring.generate(10) + '_' + file.originalname);
    }
  });
  var upload = multer(_.extend(config.uploads, {
    storage: storage
  })).single('pemFile');

  upload(req, res, function(uploadError) {
    if(uploadError) {
      return res.status(400).send({
        message: 'Error occurred while uploading file'
      });
    } else {
      fs.chmodSync(req.file.path, '0777');
      // we are saving pem file into mongodb database as string.
      fs.readFile(req.file.path, 'utf8', function(err, data) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }

        var fileName = req.query && req.query.fileName ? req.query.fileName : 'keyPem';
        if (fileName === 'keyPem') {
          req.application.passPhrase = (req.query && req.query.passPhrase) || '';
        }
        req.application[fileName] = data;
        fs.unlinkSync(req.file.path);
        req.application.save()
        .then(function(application) {
          res.json(application);
        })
        .catch(function(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        });
      });
    }
  });
};

/**
 * Uploads animation
 */
exports.uploadImage = function (req, res) {
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, config.uploads.dest);
    },
    filename: function(req, file, cb) {
      cb(null, randomstring.generate(10) + '_' + file.originalname);
    }
  });
  var upload = multer(_.extend(config.uploads, {
    storage: storage
  })).single('image');
  var application = req.application;
  upload(req, res, function(uploadError) {
    if(uploadError) {
      return res.status(400).send({
        message: 'Error occurred while uploading picture'
      });
    } else {
      fs.chmodSync(req.file.path, '0777');
      ImageLib.uploadToAWS(req.file, function(err, image) {
        fs.unlinkSync(req.file.path);
        if (err) {
          return res.status(400).send({
            message: err
          });
        }

        if (image) {
          application.image = image;
          application.save(function (err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(application);
            }
          });
        }
      });
    }
  });
};

/**
 * Application middleware
 */
exports.applicationByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Application is invalid'
    });
  }

  Application.findById(id).populate('image').exec(function (err, application) {
    if (err) {
      return next(err);
    } else if (!application) {
      return res.status(404).send({
        message: 'No application with that identifier has been found'
      });
    }
    req.application = application;
    next();
  });
};
