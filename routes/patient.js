const express = require("express");
const router = express.Router();
const patientController = require("../controller/patientController");

// Route to get a patient by ID
router.get("/:id", patientController.getPatientById);

// Route to get all patients
router.get("/", patientController.getAllPatients);

// Route to update a patient
router.put("/update/:id", patientController.updatePatient);

module.exports = router;
