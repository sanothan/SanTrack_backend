const transporter = require("../config/email");
const { getIssueSubmittedTemplate, getIssueStatusUpdatedTemplate } = require("../templates/emailTemplates");

const sendEmail = async (msg) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Skipping email sending: Nodemailer credentials not configured.");
        return;
    }

    try {
        const info = await transporter.sendMail(msg);
        console.log(`Email sent successfully to ${msg.to}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email via Nodemailer:", error);
    }
};

const sendIssueSubmittedEmail = async ({ to, issue, villageName, reporterName }) => {
    const { subject, html } = getIssueSubmittedTemplate({
        issueId: issue._id,
        description: issue.description,
        villageName,
        reporterName,
        status: issue.status,
    });

    const msg = {
        to,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        subject,
        html,
    };

    await sendEmail(msg);
};

const sendIssueStatusUpdatedEmail = async ({ to, issue, oldStatus, newStatus, reporterName }) => {
    const { subject, html } = getIssueStatusUpdatedTemplate({
        issueId: issue._id,
        description: issue.description,
        oldStatus,
        newStatus,
        reporterName,
    });

    const msg = {
        to,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        subject,
        html,
    };

    await sendEmail(msg);
};

// Optional: sendAdminNewIssueEmail
const sendAdminNewIssueEmail = async ({ to, issue }) => {
    const msg = {
        to: to || process.env.EMAIL_ADMIN_NOTIFY,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        subject: `New Issue Reported: ${issue._id}`,
        html: `<p>A new issue has been reported: ${issue.description}</p>`
    };
    await sendEmail(msg);
};

module.exports = {
    sendIssueSubmittedEmail,
    sendIssueStatusUpdatedEmail,
    sendAdminNewIssueEmail,
};
