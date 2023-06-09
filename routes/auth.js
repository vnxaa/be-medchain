const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const verifyHospitalToken = require("../middleware/auth");

// Login endpoint for patient
router.post("/patient/login", authController.patientLogin);

// Login endpoint for hospitals
router.post("/hospital/login", authController.hospitalLogin);

// Login endpoint for doctor
router.post("/doctor/login", authController.doctorLogin);

router.post("/register", authController.register);
router.post("/login", authController.login);
// Update doctor status endpoint
router.put(
  "/doctor/status",
  verifyHospitalToken,
  authController.updateDoctorStatus
);
//user forget password
router.post("/reset-password", authController.resetPassword);
// get all user name
router.get("/usernames", authController.getAllUsernames);
module.exports = router;
