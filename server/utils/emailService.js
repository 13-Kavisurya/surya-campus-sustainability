const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If SMTP credentials are not provided or are placeholders, log the email to the console
    const isPlaceholder = process.env.EMAIL_USER?.includes('your-email') || process.env.EMAIL_PASS?.includes('your-app-password');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || isPlaceholder) {
        console.log('--- EMAIL SIMULATION MODE (No credentials configured) ---');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.text}`);
        console.log('------ Configure EMAIL_USER and EMAIL_PASS in .env to send real emails ------');
        return { message: 'Email simulated - configure .env credentials to send real emails', simulated: true };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this or use host/port
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Campus Sustainability Platform" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Email Error:', error);
        throw error;
    }
};

// Manager notification helper
exports.sendManagerAlert = async (managerEmails, issueData) => {
    const subject = `[URGENT] New Resource Issue Reported: ${issueData.issueType}`;
    const text = `
        A new issue has been reported by a student.
        
        Resource: ${issueData.resourceType}
        Issue: ${issueData.issueType}
        Location: ${issueData.location}
        Description: ${issueData.description}
        
        Please log in to the Manager Terminal to review and assign this task.
    `;

    await sendEmail({
        to: managerEmails.join(','),
        subject,
        text
    });
};

// Student resolution helper
exports.sendStudentResolutionEmail = async (studentEmail, issueData) => {
    const subject = `Issue Resolved: ${issueData.issueType} at ${issueData.location}`;
    const text = `
        Great news! The issue you reported has been resolved.
        
        Summary of Resolution:
        - Resource: ${issueData.resourceType}
        - Monthly Consumption Reduction: ${issueData.savingsEstimation.monthlyReduction} units
        - Overusage Estimated: ${issueData.savingsEstimation.overusage}%
        
        Thank you for helping us make the campus more sustainable!
    `;

    await sendEmail({
        to: studentEmail,
        subject,
        text
    });
};

// Monthly report helper
exports.sendMonthlyReport = async (userEmail, userName, reportData) => {
    const subject = `Monthly Sustainability Report - ${reportData.period}`;

    let resourceDetails = '';
    Object.entries(reportData.resourceBreakdown).forEach(([resource, data]) => {
        resourceDetails += `
        ${resource}:
          - Issues Resolved: ${data.count}
          - Reduction: ${data.reduction} units/month
          - Avg Overusage: ${Math.round(data.overusage / data.count * 10) / 10}%
        `;
    });

    const text = `
        Dear ${userName},
        
        Here's your Campus Sustainability Report for ${reportData.period}:
        
        OVERALL SUMMARY:
        - Total Issues Resolved: ${reportData.issuesResolved}
        - Total Resource Reduction: ${reportData.totalReduction} units/month
        - Average Overusage Before Fixes: ${reportData.avgOverusage}%
        
        RESOURCE BREAKDOWN:${resourceDetails}
        
        Thank you for contributing to a more sustainable campus!
        
        Best regards,
        Campus Sustainability Team
    `;

    await sendEmail({
        to: userEmail,
        subject,
        text
    });
};
