const express = require("express");
const router = express.Router();
const medicalRecordsController = require("../controller/medicalRecordsController");

// Route to create a new medical record
router.post("/create", medicalRecordsController.createMedicalRecord);

// Route to get a medical record by ID
router.get("/:id", medicalRecordsController.getMedicalRecordById);

// Route to get all medical records
router.get("/", medicalRecordsController.getAllMedicalRecords);

// Route to update the status of a medical record by ID
router.put("/status/:id", medicalRecordsController.updateMedicalRecordStatus);

// Route to get medical records by patient ID
router.get(
  "/patient/:patientId",
  medicalRecordsController.getMedicalRecordsByPatientId
);
// Route to update the diagnosis of a medical record by ID
router.put(
  "/diagnosis/:id",
  medicalRecordsController.updateMedicalRecordDiagnosis
);
// Route to get medical records by doctor ID
router.get(
  "/doctor/:doctorId/",
  medicalRecordsController.getMedicalRecordsByDoctorId
);
// Route to get all medical records for statistics
router.get(
  "/hospital/statistics/",
  medicalRecordsController.getAllMedicalRecordsForStatistics
);
module.exports = router;
