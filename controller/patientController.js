const { Patient } = require("../models/UserModels");

// Get a patient by ID
const getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the patient by ID
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    // Find all patients
    const patients = await Patient.find();

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a patient
const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { picture, gender, birthday, address, contactNumber, name } = req.body;

  try {
    // Find the patient by ID
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update the patient information
    patient.picture = picture;
    patient.gender = gender;
    patient.birthday = birthday;
    patient.address = address;
    patient.contactNumber = contactNumber;
    patient.name = name;

    // Save the updated patient
    const updatedPatient = await patient.save();

    res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getPatientById,
  getAllPatients,
  updatePatient,
};
