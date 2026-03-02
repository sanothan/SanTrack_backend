const getIssueSubmittedTemplate = ({ issueId, description, villageName, reporterName, status }) => {
    const subject = `Issue Submitted: ${issueId.toString().slice(-6).toUpperCase()} - ${villageName}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">SanTrack - Issue Received</h2>
      <p>Hello <strong>${reporterName}</strong>,</p>
      <p>Thank you for reporting a sanitation issue. Your report helps us maintain a cleaner and safer community (SDG 6).</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Issue ID:</strong> ${issueId}</p>
        <p><strong>Village:</strong> ${villageName}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Status:</strong> <span style="color: #e67e22; font-weight: bold;">${status.toUpperCase()}</span></p>
      </div>
      
      <p>We will notify you as soon as the status of this issue changes.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #7f8c8d; text-align: center;">This is an automated message from SanTrack. Please do not reply.</p>
    </div>
  `;
    return { subject, html };
};

const getIssueStatusUpdatedTemplate = ({ issueId, description, oldStatus, newStatus, reporterName }) => {
    const subject = `Issue Status Updated: ${issueId.toString().slice(-6).toUpperCase()}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">SanTrack - Issue Status Update</h2>
      <p>Hello <strong>${reporterName}</strong>,</p>
      <p>The status of your reported issue has been updated.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Issue ID:</strong> ${issueId}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Old Status:</strong> <span style="text-decoration: line-through; color: #7f8c8d;">${oldStatus.replace('_', ' ')}</span></p>
        <p><strong>New Status:</strong> <span style="color: #27ae60; font-weight: bold; text-transform: uppercase;">${newStatus.replace('_', ' ')}</span></p>
      </div>
      
      <p>Thank you for your patience as we work to resolve this issue.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #7f8c8d; text-align: center;">This is an automated message from SanTrack. Please do not reply.</p>
    </div>
  `;
    return { subject, html };
};

module.exports = {
    getIssueSubmittedTemplate,
    getIssueStatusUpdatedTemplate,
};
