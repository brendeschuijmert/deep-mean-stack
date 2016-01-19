'use strict';

var moment = require('moment');

exports.getNextSchedule = function(scheduleObj) {
  switch (scheduleObj.frequency) {
    case 'immediate':
      return moment(scheduleObj.sendDate).format();
    case 'scheduled':
      if (scheduleObj.lastSent) {
        var momentObj = moment(scheduleObj.lastSent);
        switch (scheduleObj.frequency) {
          case 'once':
            return null;
          case 'daily':
            return momentObj.add(1, 'day').format();
          case 'weekly':
            return momentObj.add(7, 'days').format();
          case 'monthly':
            return momentObj.add(1, 'month').format();
        }
      } else {
        return moment(scheduleObj.sendDate).format();
      }
      break;
  }
};
