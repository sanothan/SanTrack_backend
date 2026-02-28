const calculateInspectionStatus = (score) => {
  if (score <= 3) return "critical";
  if (score <= 6) return "needs_attention";
  return "good";
};

module.exports = {
  calculateInspectionStatus,
};
