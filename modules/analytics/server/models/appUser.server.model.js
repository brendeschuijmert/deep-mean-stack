'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * AppUser Schema
 */
var AppUserSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  application: {
    type: Schema.ObjectId,
    ref: 'Application'
  },
  userDevice: {
    type: Schema.ObjectId,
    ref: 'UserDevice'
  }
});

mongoose.model('AppUser', AppUserSchema);
