const cron = require('cron');
const { deleteUser, deleteRefreshToken, deleteResetPasswordToken } = require('../commands/users');

const methods = {
  runEveryMinute: () => {
    const job = new cron.CronJob('0 * * * * *', async () => {
      console.log('Cron Running every minute', new Date());

      await deleteUser();
      await deleteRefreshToken();
      await deleteResetPasswordToken();
    });

    job.start();
  },

  runEvery30Minutes: () => {
    const job = new cron.CronJob('*/30 * * * *', () => {
      console.log('Cron Running every 30 minutes', new Date());
    });

    job.start();
  },

  runEveryHour: () => {
    const job = new cron.CronJob('0 * * * *', async () => {
      console.log('Cron Running every hour', new Date());
    });

    job.start();
  },

  runEveryDayAtMidnight: () => {
    const job = new cron.CronJob('0 0 0 * * *', async () => {
      console.log('Cron Running every day at midnight', new Date());
    });

    job.start();
  },

  runOnFirstDayOfWeek: () => {
    const job = new cron.CronJob('0 0 * * 1', () => {
      console.log('Cron Running on the first day of the week', new Date());
    });

    job.start();
  },

  runOnFirstDayOfMonth: () => {
    const job = new cron.CronJob('0 0 1 * *', () => {
      console.log('Cron Running on the first day of the month', new Date());
    });

    job.start();
  },

  run: () => {
    methods.runEveryMinute();
    methods.runEvery30Minutes();
    methods.runEveryHour();
    methods.runEveryDayAtMidnight();
    methods.runOnFirstDayOfWeek();
    methods.runOnFirstDayOfMonth();
  },
};

module.exports = methods;
