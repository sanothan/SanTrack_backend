const Schedule = require("../models/Schedule");

exports.getSchedules = async (req, res) => {
    try {
        const query = {};
        // If not admin, only show specific inspector's schedule
        if (req.user.role !== "admin") {
            query.inspectorId = req.user.id;
        }

        const schedules = await Schedule.find(query)
            .populate("facilityId")
            .populate("inspectorId", "name email")
            .sort({ scheduledDate: 1 });

        res.status(200).json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { facilityId, scheduledDate, priority, notes } = req.body;

        const schedule = await Schedule.create({
            facilityId,
            inspectorId: req.user.id,
            scheduledDate,
            priority,
            notes
        });

        const populatedSchedule = await Schedule.findById(schedule._id)
            .populate("facilityId")
            .populate("inspectorId", "name email");

        res.status(201).json(populatedSchedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("facilityId").populate("inspectorId", "name email");

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Schedule not found" });
        }

        res.status(200).json(schedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
