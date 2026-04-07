const User = require('../models/User');
const ResourceIssue = require('../models/ResourceIssue');
const emailService = require('./emailService');

// Generate monthly usage report for all users
exports.generateMonthlyReport = async () => {
    try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get all resolved issues from last month
        const resolvedIssues = await ResourceIssue.find({
            status: 'Resolved',
            updatedAt: { $gte: lastMonth, $lt: thisMonth }
        });

        // Aggregate data
        const totalReduction = resolvedIssues.reduce((sum, issue) =>
            sum + (issue.savingsEstimation?.monthlyReduction || 0), 0
        );

        const avgOverusage = resolvedIssues.length > 0
            ? resolvedIssues.reduce((sum, issue) =>
                sum + (issue.savingsEstimation?.overusage || 0), 0) / resolvedIssues.length
            : 0;

        const resourceBreakdown = {};
        resolvedIssues.forEach(issue => {
            if (!resourceBreakdown[issue.resourceType]) {
                resourceBreakdown[issue.resourceType] = {
                    count: 0,
                    reduction: 0,
                    overusage: 0
                };
            }
            resourceBreakdown[issue.resourceType].count++;
            resourceBreakdown[issue.resourceType].reduction += issue.savingsEstimation?.monthlyReduction || 0;
            resourceBreakdown[issue.resourceType].overusage += issue.savingsEstimation?.overusage || 0;
        });

        return {
            period: `${lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
            totalReduction,
            avgOverusage: Math.round(avgOverusage * 10) / 10,
            issuesResolved: resolvedIssues.length,
            resourceBreakdown
        };
    } catch (error) {
        console.error('Error generating monthly report:', error);
        throw error;
    }
};

// Send monthly report to all users
exports.sendMonthlyReportToAll = async () => {
    try {
        const report = await exports.generateMonthlyReport();
        const users = await User.find({});

        console.log(`Sending monthly report to ${users.length} users...`);

        const emailPromises = users.map(user =>
            emailService.sendMonthlyReport(user.email, user.name, report)
        );

        await Promise.all(emailPromises);
        console.log('Monthly reports sent successfully!');
    } catch (error) {
        console.error('Error sending monthly reports:', error);
    }
};
