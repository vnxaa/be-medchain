const express = require("express");
const router = express.Router();
const appointmentsControllers = require("../controller/appointmentsControllers");

// Route to get a hospital by ID
router.post("/create", appointmentsControllers.makeAppointment);

// Route to update a hospital
router.get("/", appointmentsControllers.getAllAppointments);
router.get(
  "/patient/:patientId/:doctorId",
  appointmentsControllers.getAppointmentsByPatientId
);
router.get(
  "/doctor/:doctorId",
  appointmentsControllers.getAppointmentsByDoctorId
);
// PUT update appointment status
router.put(
  "/status/:appointmentId",
  appointmentsControllers.updateAppointmentStatus
);

module.exports = router;
