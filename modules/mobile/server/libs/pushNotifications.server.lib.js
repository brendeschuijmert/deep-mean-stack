'use strict';

var chalk = require('chalk');

exports.send = function(campaign) {
  // TODO: use segments
  console.log('CAMPAIGN');
  console.log(chalk.bold.green(campaign.toObject()));
};
