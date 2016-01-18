'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * CampaignSchedule Schema
 */
var CampaignScheduleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  repeat: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once'
  },
  sendDate: {
    type: Date
  },
  timeZone: {
    type: String,
    default: '',
    trim: ''
  },
  status: {
    type: String,
    enum: ['ready', 'inprogress']
  },
  lastSent: {
    type: Date
  },
  nextSend: {
    type: Date
  },
  frequency: {
    type: String,
    enum: ['immediate', 'scheduled']
  },
  campaign: {
    type: Schema.ObjectId,
    ref: 'Campaign'
  }
});

mongoose.model('CampaignSchedule', CampaignScheduleSchema);
