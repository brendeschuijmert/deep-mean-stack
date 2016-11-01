'use strict';

module.exports = {
  app: {
    title: 'Dynamic Push',
    description: 'Dynamic Push',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // secret and expire for
  apiSecret: 'dp-meanstack-!@#@',
  apiTokenExpire: 24 * 60 * 30, // one month
  // session secret and expire for mobile tokens
  mobileSessionSecret: 'MEANSESSION',
  mobileTokenExpire: 24*60*7, // one week
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    dest: './tmp/', // tmp uploads path
    limits: {
      fileSize: 1*1024*1024 // Max file size in bytes (1 MB)
    }
  },
  aws: {
    bucket: 'dp-mean',
    accessKeyId: 'AKIAJ7MS2AC3YICO235Q',
    secretAccessKey: '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'
  }
};
