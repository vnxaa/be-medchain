const express = require("express");
const router = express.Router();
const medicalRecordsController = require("../controller/medicalRecordsController");

// Route to create a new medical record
router.post("/create", medicalRecordsController.createMedicalRecord);

// Route to get a medical record by ID
router.get("/:id", medicalRecordsController.getMedicalRecordById);

// Route to get all medical records
router.get("/", medicalRecordsController.getAllMedicalRecords);

module.exports = router;
