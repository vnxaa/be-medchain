const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");
const { Patient } = require("../models/UserModels");
// POST /medical-records
router.post("/create", async (req, res) => {
  try {
    // Extract the data from the request body
    const { patientId, doctorId, diagnosis } = req.body;

    // Create a new medical record
    const medicalRecord = new MedicalRecord({
      patientId,
      doctorId,
      diagnosis,
    });

    // Save the medical record to the database
    await medicalRecord.save();

    // Find the user by patientId and update the medicalRecordsOwner field
    await Patient.findOneAndUpdate(
      { _id: patientId },
      { $push: { medicalRecordsOwner: medicalRecord._id } }
    );

    // Return the saved medical record as the response
    res.json(medicalRecord);
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res.status(500).json({ error: "Failed to create a medical record" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const medicalRecordId = req.params.id;

    // Find the medical record by ID
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);

    if (!medicalRecord) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Return the medical record as the response
    res.json(medicalRecord);
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve the medical record" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Retrieve all medical records
    const medicalRecords = await MedicalRecord.find();

    // Return the medical records as the response
    res.json(medicalRecords);
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve the medical records" });
  }
});

module.exports = router;
