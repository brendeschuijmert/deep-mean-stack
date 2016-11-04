'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Team Schema
 */
var TeamSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  name: {
    type: String,
    trim: true,
    required: 'Team name is required'
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  members: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
});

mongoose.model('Team', TeamSchema);
