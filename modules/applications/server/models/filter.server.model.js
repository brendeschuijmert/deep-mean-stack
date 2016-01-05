'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Filter Schema
 */
var FilterSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  operator: {
    type: String,
    enum: ['>', '<', '<=', '>=', '='],
    default: '='
  },
  value: {
    type: String,
    trim: true,
    default: ''
  },
  logicOperator: {
    type: String,
    enum: ['AND', 'OR']
  },
  parentFilter: {
    type: Schema.ObjectId,
    ref: 'Filter'
  },
  childrenFilters: [{
    type: Schema.ObjectId,
    ref: 'Filter'
  }]
});

mongoose.model('Filter', FilterSchema);
