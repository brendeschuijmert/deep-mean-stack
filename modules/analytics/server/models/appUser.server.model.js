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
  uuid: {
    type: String,
    required: 'UUID can not be blank'
  },
  userDevice: {
    type: Schema.ObjectId,
    ref: 'UserDevice'
  }
});

mongoose.model('AppUser', AppUserSchema);
