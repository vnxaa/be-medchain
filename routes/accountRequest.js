const express = require("express");
const router = express.Router();
const accountRequestController = require("../controller/accountRequestController");

// Route to create a new account request
router.post("/", accountRequestController.createAccountRequest);

// Route to get all account requests
router.get("/", accountRequestController.getAllAccountRequests);

// Route to get a single account request by ID
router.get("/:id", accountRequestController.getAccountRequestById);

// Route to get account requests by role
router.get("/role/:role", accountRequestController.getAccountRequestsByRole);

// Route to update the status of an account request
router.put("/status/:id", accountRequestController.updateAccountRequestStatus);
// Route to get the total counts of staff, patients, and doctors
router.get("/total/user", accountRequestController.getTotalUser);
// Route to get the total request account of doctors
router.get(
  "/total/doctor-account",
  accountRequestController.getDoctorAccountRequestStatistics
);
router.get(
  "/total/staff-account",
  accountRequestController.getStaffAccountRequestStatistics
);
// Route to get the count of male and female patients based on age group
router.get(
  "/patient/gender-counts",
  accountRequestController.getPatientGenderCounts
);
// Route to get the count of male and female doctors based on age group
router.get(
  "/doctor/gender-counts",
  accountRequestController.getDoctorGenderCounts
);
// Route to get the count of male and female staffs based on age group
router.get(
  "/staff/gender-counts",
  accountRequestController.getDoctorGenderCounts
);
// Route to check if an email already exists for a Staff or Doctor
router.post("/checkEmailExist", accountRequestController.checkEmailExist);
module.exports = router;
