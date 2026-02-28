const Issue = require("../models/Issue");
const Facility = require("../models/Facility");
const Inspection = require("../models/Inspection");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");

const createIssue = asyncHandler(async (req, res) => {
  const { facilityId, inspectionId, description } = req.body;

  const facility = await Facility.findById(facilityId);
  if (!facility) throw new ApiError(404, "Facility not found");

  if (inspectionId) {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) throw new ApiError(404, "Inspection not found");
  }

  const issueData = {
    facilityId,
    inspectionId,
    description,
    status: "pending",
  };

  // If reported by a user (staff or community)
  if (req.user) {
    if (req.user.role === 'community') {
      issueData.reporterId = req.user.id;
      issueData.isPublic = true;
    } else {
      // If inspector/admin, we still track reporterId for audit
      issueData.reporterId = req.user.id;
    }
  }

  const issue = await Issue.create(issueData);

  res.status(201).json(issue);
});

const createPublicIssue = asyncHandler(async (req, res) => {
  const { facilityId, description, reporterName, reporterContact } = req.body;

  const facility = await Facility.findById(facilityId);
  if (!facility) throw new ApiError(404, "Facility not found");

  const issue = await Issue.create({
    facilityId,
    description,
    reporterName: reporterName || "Anonymous Citizen",
    reporterContact: reporterContact || "",
    isPublic: true,
    status: "pending",
  });

  res.status(201).json(issue);
});

const getIssues = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  // Citizens only see their own reports
  if (req.user.role === "community") {
    filter.reporterId = req.user.id;
  }

  const issues = await Issue.find(filter)
    .populate("facilityId", "name type condition")
    .populate("inspectionId", "score status date")
    .sort({ createdAt: -1 });

  res.status(200).json(issues);
});

const getIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid issue id");

  const issue = await Issue.findById(id)
    .populate("facilityId", "name type condition")
    .populate("inspectionId", "score status date");

  if (!issue) throw new ApiError(404, "Issue not found");
  res.status(200).json(issue);
});

const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid issue id");

  if (req.body.facilityId) {
    const facility = await Facility.findById(req.body.facilityId);
    if (!facility) throw new ApiError(404, "Facility not found");
  }

  if (req.body.inspectionId) {
    const inspection = await Inspection.findById(req.body.inspectionId);
    if (!inspection) throw new ApiError(404, "Inspection not found");
  }

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, "Issue not found");

  Object.assign(issue, req.body);

  if (issue.status === "resolved" && !issue.resolvedAt) {
    issue.resolvedAt = new Date();
  }
  if (issue.status !== "resolved") {
    issue.resolvedAt = null;
  }

  await issue.save();
  res.status(200).json(issue);
});

const deleteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid issue id");

  const issue = await Issue.findByIdAndDelete(id);
  if (!issue) throw new ApiError(404, "Issue not found");

  res.status(200).json({ message: "Issue deleted successfully" });
});

module.exports = {
  createIssue,
  createPublicIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
