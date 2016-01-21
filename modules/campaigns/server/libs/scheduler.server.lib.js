'use strict';

var moment = require('moment-timezone');

exports.getCrontabString = function(scheduleObj) {
  var scheduledTime = moment.tz(scheduleObj.sendDate, scheduleObj.timeZone);
  var cronArray = [];
  scheduledTime.tz(moment.tz.guess()); // set as server time zone
  cronArray.push(scheduledTime.minute());
  cronArray.push(scheduledTime.hour());
  switch (scheduleObj.repeat) {
    case 'once':
      cronArray.push(scheduledTime.date());
      cronArray.push(scheduledTime.month() + 1);
      cronArray.push(scheduledTime.day());
      break;
    case 'daily':
      cronArray.push('*');
      cronArray.push('*');
      cronArray.push('*');
      break;
    case 'weekly':
      cronArray.push('*');
      cronArray.push('*');
      cronArray.push(scheduledTime.day());
      break;
    case 'monthly':
      cronArray.push(scheduledTime.date());
      cronArray.push('*');
      cronArray.push('*');
      break;
  }
  return cronArray.join(' ');
};
