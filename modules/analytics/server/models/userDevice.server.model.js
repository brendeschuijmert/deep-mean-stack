'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * UserDevice Schema
 */
var UserDeviceSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  appUser: {
    type: Schema.ObjectId,
    ref: 'AppUser'
  },
  gcmToken: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  name: {
    type: String,
    trim: true,
    default: ''
  }
  gender: {
    type: String
  },
  location: {
    lat: String,
    lng: String
  },
  language: {
    type: String,
    default: '',
    trim: true
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  zipcode: {
    type: String,
    trim: true,
    default: ''
  },
  osNumber: {
    type: String,
    trim: true,
    default: '',
    required: 'OS number is required'
  },
  modelNumber: {
    type: String,
    trim: true,
    default: '',
    required: 'Model number is required'
  }
});

mongoose.model('UserDevice', UserDeviceSchema);
