const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventsController");

router.get("/doctor/:doctorId", eventController.getEventsForDoctorByDoctorId);
router.get(
  "/patient/:doctorId/:patientId",
  eventController.getEventsForPatientByDoctorIdAndPatientId
);
router.get("/staff/:doctorId", eventController.getEventsForStaffByDoctorId);

module.exports = router;
