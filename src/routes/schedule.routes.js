const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
} = require("../controllers/schedule.controller");

const router = express.Router();

router.use(verifyToken);

router.route("/")
    .get(getSchedules)
    .post(createSchedule);

router.route("/:id")
    .patch(updateSchedule)
    .delete(deleteSchedule);

module.exports = router;
