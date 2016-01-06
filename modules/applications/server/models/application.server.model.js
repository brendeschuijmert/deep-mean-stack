'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  appName: {
    type: String,
    default: '',
    trim: true,
    required: 'Application name can not be blank'
  },
  packageName: {
    type: String,
    default: '',
    trim: true,
    required: 'Package name can not be blank'
  },
  appToken: {
    type: String,
    default: '',
    trim: true
  },
  googleApiKey: {
    type: String,
    default: '',
    trim: true
  },
  googleApiSecret: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: Schema.ObjectId,
    ref: 'Image'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Application', ApplicationSchema);
