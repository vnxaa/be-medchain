const { Patient } = require("../models/UserModels");
const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;

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
  const {
    picture,
    gender,
    birthday,
    address,
    name,
    fatherName,
    motherName,
    fatherContact,
    motherContact,
  } = req.body;

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
    patient.name = name;
    patient.fatherName = fatherName;
    patient.motherName = motherName;
    patient.fatherContact = fatherContact;
    patient.motherContact = motherContact;

    // Save the updated patient
    const updatedPatient = await patient.save();

    res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const updatePicture = async (req, res) => {
  try {
    const { picture } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { picture },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: "patient not found" });
    }

    // Create a new JWT token with the updated patient data
    const updatedToken = jwt.sign(
      { patient },
      secretKey,
      { expiresIn: "5h" } // Set the token expiration as desired
    );

    res.json({ patient, token: updatedToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const updatePatientInformation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      gender,
      fatherName,
      motherName,
      fatherContact,
      motherContact,
      socialInsuranceId,
      email,
      birthday,
    } = req.body;

    // Validate the required fields
    if (
      !name ||
      !address ||
      !gender ||
      !fatherName ||
      !socialInsuranceId ||
      !email ||
      !birthday ||
      !motherName ||
      !fatherContact ||
      !motherContact
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Find the patient by ID
    let patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update patient information with the provided data only if the field has changed
    if (name !== patient.name) {
      patient.name = name;
    }
    if (address !== patient.address) {
      patient.address = address;
    }
    if (gender !== patient.gender) {
      patient.gender = gender;
    }
    if (fatherName !== patient.fatherName) {
      patient.fatherName = fatherName;
    }
    if (motherName !== patient.motherName) {
      patient.motherName = motherName;
    }
    if (fatherContact !== patient.fatherContact) {
      patient.fatherContact = fatherContact;
    }
    if (motherContact !== patient.motherContact) {
      patient.motherContact = motherContact;
    }
    if (socialInsuranceId !== patient.socialInsuranceId) {
      patient.socialInsuranceId = socialInsuranceId;
    }
    if (email !== patient.email) {
      patient.email = email;
    }
    if (birthday !== patient.birthday) {
      patient.birthday = birthday;
    }

    // Save the updated patient information
    patient = await patient.save();

    const updatedToken = jwt.sign(
      { patient },
      secretKey,
      { expiresIn: "5h" } // Set the token expiration as desired
    );

    res.json({ patient, token: updatedToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  getPatientById,
  getAllPatients,
  updatePatient,
  updatePicture,
  updatePatientInformation,
};
