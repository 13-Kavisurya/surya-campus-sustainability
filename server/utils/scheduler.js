const cron = require('node-cron');
const monthlyReportService = require('../utils/monthlyReportService');

// Schedule monthly report to run on the 1st of every month at 9:00 AM
const scheduleMonthlyReport = () => {
    // Cron format: minute hour day month day-of-week
    // '0 9 1 * *' = At 9:00 AM on the 1st of every month
    cron.schedule('0 9 1 * *', async () => {
        console.log('Running scheduled monthly report...');
        await monthlyReportService.sendMonthlyReportToAll();
    });

    console.log('Monthly report scheduler initialized (runs 1st of each month at 9:00 AM)');
};

module.exports = { scheduleMonthlyReport };
