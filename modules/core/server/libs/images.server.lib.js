'use strict';

var path = require('path'),
  Uploader = require('s3-uploader'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  _ = require('lodash'),
  ImageModel = mongoose.model('Image'),
  config = require(path.resolve('./config/config')),
  gifyParse = require('gify-parse'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
//
// mongoose.Promise = require('bluebird');

exports.uploadToAWS = function(imgObj, cb) {
  var buffer = fs.readFileSync(imgObj.path);
  var gifInfo = gifyParse.getInfo(buffer);

  // For now let's accept only gif files and no resizing
  if (gifInfo.valid && gifInfo.duration) {
    // upload to amazon
    var client = new Uploader(config.aws.bucket, {
      aws: {
        path: 'campaigns/',
        acl: 'public-read',
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      },
      cleanup: {
        versions: false,
        original: true
      },
      original: {
        awsImageAcl: 'public-read'
      }
    });

    client.upload(imgObj.path, {}, function(err, versions, meta) {
      if (err) {
        cb(err, null);
      }else if (versions.length) {
        // saving image to mongo db
        var imageJson = {
          url: versions[0].url,
          type: imgObj.mimetype,
          size: imgObj.size,
          duration: gifInfo.duration
        };
        var image = new ImageModel(imageJson);
        image.save(function (err) {
          if (err) {
            cb(err, null);
          } else {
            cb(null, image);
          }
        });

      }
    });
  } else {
    cb('Image is not valid gif.', null);
  }
};
