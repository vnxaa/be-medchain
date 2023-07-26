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
// Route for approving an appointment
router.put(
  "/approve/:appointmentId",
  appointmentsControllers.approveAppointment
);
//get by appointmentId
router.get("/:appointmentId", appointmentsControllers.getAppointmentById);
// Get appointment by code
router.get(
  "/code/:appointmentCode",
  appointmentsControllers.getAppointmentByCode
);

// API to get the appointment booking rate for each day of the week
router.get(
  "/booking-rate/:doctorId",
  appointmentsControllers.getAppointmentBookingRate
);
// API to get all appointments with status "pending" for the current week
router.get(
  "/pending/current-week",
  appointmentsControllers.getPendingAppointmentsForCurrentWeek
);
router.get(
  "/confirmed-and-cancelled/current-week",
  appointmentsControllers.getConfirmedAndCancelledAppointmentsForCurrentWeek
);
module.exports = router;
