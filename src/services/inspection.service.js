const Issue = require("../models/Issue");
const Schedule = require("../models/Schedule");

const calculateInspectionStatus = (score) => {
  if (score <= 3) return "critical";
  if (score <= 6) return "needs_attention";
  return "good";
};

const AUTO_CRITICAL_NOTE_TAG = "[AUTO_CRITICAL_FOLLOWUP]";
const CRITICAL_FIX_SLA_HOURS = 48;
const AUTO_CRITICAL_ISSUE_PREFIX = "Auto-generated from critical inspection";

const buildCriticalIssueDescription = (inspection) => {
  const inspectionDate = new Date(inspection.date || Date.now()).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return [
    `${AUTO_CRITICAL_ISSUE_PREFIX} (${inspection._id}).`,
    `Inspection score: ${inspection.score}/10 on ${inspectionDate}.`,
    `Immediate maintenance and verification re-inspection required.`,
  ].join(" ");
};

const buildCriticalScheduleNote = (inspection) => {
  return `${AUTO_CRITICAL_NOTE_TAG} Auto follow-up for critical inspection ${inspection._id}. Prioritize repair and recheck.`;
};

const ensureCriticalFollowUp = async (inspection) => {
  if (!inspection || inspection.status !== "critical") {
    return { issueCreated: false, issueUpdated: false, scheduleCreated: false, scheduleUpdated: false };
  }

  const dueDate = new Date(inspection.date || Date.now());
  dueDate.setHours(dueDate.getHours() + CRITICAL_FIX_SLA_HOURS);

  let issueCreated = false;
  let issueUpdated = false;
  let scheduleCreated = false;
  let scheduleUpdated = false;

  const existingOpenIssue = await Issue.findOne({
    facilityId: inspection.facilityId,
    isPublic: false,
    description: { $regex: `^${AUTO_CRITICAL_ISSUE_PREFIX}` },
    status: { $in: ["pending", "in_progress"] },
  }).sort({ createdAt: -1 });

  if (existingOpenIssue) {
    const nextDescription = buildCriticalIssueDescription(inspection);
    if (
      existingOpenIssue.inspectionId?.toString() !== inspection._id.toString() ||
      existingOpenIssue.description !== nextDescription
    ) {
      existingOpenIssue.inspectionId = inspection._id;
      existingOpenIssue.description = nextDescription;
      await existingOpenIssue.save();
      issueUpdated = true;
    }
  } else {
    await Issue.create({
      facilityId: inspection.facilityId,
      inspectionId: inspection._id,
      reporterId: inspection.inspectorId,
      description: buildCriticalIssueDescription(inspection),
      status: "pending",
      isPublic: false,
    });
    issueCreated = true;
  }

  const existingPendingSchedule = await Schedule.findOne({
    facilityId: inspection.facilityId,
    inspectorId: inspection.inspectorId,
    status: "pending",
  }).sort({ scheduledDate: 1 });

  if (existingPendingSchedule) {
    let changed = false;
    if (existingPendingSchedule.priority !== "high") {
      existingPendingSchedule.priority = "high";
      changed = true;
    }
    if (new Date(existingPendingSchedule.scheduledDate) > dueDate) {
      existingPendingSchedule.scheduledDate = dueDate;
      changed = true;
    }
    if (!existingPendingSchedule.notes || !existingPendingSchedule.notes.includes(AUTO_CRITICAL_NOTE_TAG)) {
      existingPendingSchedule.notes = buildCriticalScheduleNote(inspection);
      changed = true;
    }

    if (changed) {
      await existingPendingSchedule.save();
      scheduleUpdated = true;
    }
  } else {
    await Schedule.create({
      facilityId: inspection.facilityId,
      inspectorId: inspection.inspectorId,
      scheduledDate: dueDate,
      status: "pending",
      priority: "high",
      notes: buildCriticalScheduleNote(inspection),
    });
    scheduleCreated = true;
  }

  return { issueCreated, issueUpdated, scheduleCreated, scheduleUpdated };
};

module.exports = {
  calculateInspectionStatus,
  ensureCriticalFollowUp,
};
