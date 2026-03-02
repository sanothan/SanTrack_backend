const Issue = require("../models/Issue");
const Facility = require("../models/Facility");
const Inspection = require("../models/Inspection");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { sendIssueSubmittedEmail, sendIssueStatusUpdatedEmail } = require("./email.service");

const createIssue = async (issueData, user) => {
    const { facilityId, inspectionId, description } = issueData;

    const facility = await Facility.findById(facilityId).populate("villageId");
    if (!facility) throw new ApiError(404, "Facility not found");

    if (inspectionId) {
        const inspection = await Inspection.findById(inspectionId);
        if (!inspection) throw new ApiError(404, "Inspection not found");
    }

    const newIssueData = {
        facilityId,
        inspectionId,
        description,
        status: "pending",
    };

    if (user) {
        newIssueData.reporterId = user.id;
        if (user.role === 'community') {
            newIssueData.isPublic = true;
        }
    }

    const issue = await Issue.create(newIssueData);

    // Trigger Email (Async, non-blocking)
    if (user && user.email) {
        sendIssueSubmittedEmail({
            to: user.email,
            issue,
            villageName: facility.villageId ? facility.villageId.name : "Unknown Village",
            reporterName: user.name,
        }).catch(err => console.error("Async email error:", err));
    }

    return issue;
};

const updateIssueStatus = async (issueId, updateData, adminUser) => {
    const issue = await Issue.findById(issueId).populate("reporterId");
    if (!issue) throw new ApiError(404, "Issue not found");

    const oldStatus = issue.status;
    const newStatus = updateData.status;

    // Handle other updates if any
    Object.assign(issue, updateData);

    if (issue.status === "resolved" && !issue.resolvedAt) {
        issue.resolvedAt = new Date();
    }
    if (issue.status !== "resolved") {
        issue.resolvedAt = null;
    }

    await issue.save();

    // Trigger Email if status changed
    if (newStatus && oldStatus !== newStatus && issue.reporterId && issue.reporterId.email) {
        sendIssueStatusUpdatedEmail({
            to: issue.reporterId.email,
            issue,
            oldStatus,
            newStatus,
            reporterName: issue.reporterId.name,
        }).catch(err => console.error("Async status update email error:", err));
    }

    return issue;
};

module.exports = {
    createIssue,
    updateIssueStatus,
};
