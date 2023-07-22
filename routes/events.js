const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventsController");

router.get("/doctor/:doctorId", eventController.getEventsForDoctorByDoctorId);

router.get(
  "/patient/:doctorId/:patientId",
  eventController.getEventsForPatientByDoctorIdAndPatientId
);
router.get("/staff/:doctorId", eventController.getEventsForStaffByDoctorId);

router.get(
  "/check-appointments/:doctorId/:patientId",
  eventController.checkPatientAppointments
);
module.exports = router;
