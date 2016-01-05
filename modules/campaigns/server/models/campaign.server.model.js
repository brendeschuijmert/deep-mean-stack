'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Campaign Schema
 */
var CampaignSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  title: {
    type: String,
    trim: true,
    required: 'Campaign title can not be blank'
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: Schema.ObjectId,
    ref: 'Image'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  messagePosition: {
    type: String,
    enum: ['top', 'bottom', 'center']
  },
  expiresAt: {
    type: Date
  },
  action: {
    dpLimit: {
      type: Number,
      default: 1
    },
    dayLimit: {
      type: Number,
      default: 1
    },
    actionType: {
      type: String
    }
  },
  tags: [{
    type: String,
    trim: true,
    required: 'Tag should not be blank'
  }],
  segment: {
    type: Schema.ObjectId,
    ref: 'Segment'
  }
});

mongoose.model('Campaign', CampaignSchema);
