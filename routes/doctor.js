const express = require("express");
const router = express.Router();
const { Doctor } = require("../models/UserModels");

// Route to get all doctors
router.get("/getAll", async (req, res) => {
  try {
    // Query the database to retrieve all doctors
    const doctors = await Doctor.find();

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to get a doctor by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the doctor by ID
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to update a doctor
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    picture,
    gender,
    birthday,
    address,
    contactNumber,
  } = req.body;

  try {
    // Find the doctor by ID
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update the doctor information
    doctor.picture = picture;
    doctor.gender = gender;
    doctor.birthday = birthday;
    doctor.address = address;
    doctor.contactNumber = contactNumber;
    doctor.name = name;

    // Save the updated doctor
    const updatedDoctor = await doctor.save();

    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
