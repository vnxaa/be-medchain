const MedicalRecord = require("../models/MedicalRecord");
const { Patient } = require("../models/UserModels");

// Create a new medical record
const createMedicalRecord = async (req, res) => {
  try {
    // Extract the data from the request body
    const { patientId, doctorId, diagnosis } = req.body;

    // Create a new medical record
    const medicalRecord = new MedicalRecord({
      patientId,
      doctorId,
      diagnosis,
      status: "draft",
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
};

// Get a medical record by ID
const getMedicalRecordById = async (req, res) => {
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
};

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
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
};
// Update the status of a medical record by ID
const updateMedicalRecordStatus = async (req, res) => {
  try {
    const medicalRecordId = req.params.id;
    const { status } = req.body;

    // Find the medical record by ID
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);

    if (!medicalRecord) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Update the status of the medical record
    medicalRecord.status = status;
    await medicalRecord.save();

    // Return the updated medical record as the response
    res.json(medicalRecord);
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to update the medical record status" });
  }
};
const getMedicalRecordsByPatientId = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Find the medical records by patient ID
    const medicalRecords = await MedicalRecord.find({ patientId });

    // Return the medical records as the response
    res.json(medicalRecords);
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve the medical records" });
  }
};
const updateMedicalRecordDiagnosis = async (req, res) => {
  try {
    const medicalRecordId = req.params.id;
    const { diagnosis } = req.body;

    // Find the medical record by ID
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);

    if (!medicalRecord) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Update the diagnosis of the medical record
    medicalRecord.diagnosis = diagnosis;
    medicalRecord.status = "draft";
    await medicalRecord.save();

    // Return the updated medical record as the response
    res.json(medicalRecord);
  } catch (error) {
    // Handle any errors that occurred during the process
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to update the medical record diagnosis" });
  }
};
module.exports = {
  createMedicalRecord,
  getMedicalRecordById,
  getAllMedicalRecords,
  updateMedicalRecordStatus,
  getMedicalRecordsByPatientId,
  updateMedicalRecordDiagnosis,
};
