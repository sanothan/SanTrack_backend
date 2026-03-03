const Issue = require("../models/Issue");
const Facility = require("../models/Facility");
const Inspection = require("../models/Inspection");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { isValidObjectId } = require("../utils/objectId");
const issueService = require("../services/issue.service");

//creating an issue by community member
const createIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.createIssue(req.body, req.user);
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

//getting all issues in dashboard
const getIssues = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

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

//update
const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid issue id");

  const issue = await issueService.updateIssueStatus(id, req.body, req.user);
  res.status(200).json(issue);
});

//delete
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
