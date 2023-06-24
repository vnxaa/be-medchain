const { Doctor } = require("../models/UserModels");

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a doctor by ID
const getDoctorById = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a doctor
const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { name, picture, gender, birthday, address, contactNumber } = req.body;

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.picture = picture;
    doctor.gender = gender;
    doctor.birthday = birthday;
    doctor.address = address;
    doctor.contactNumber = contactNumber;
    doctor.name = name;

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
};
