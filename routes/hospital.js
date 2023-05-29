// Import necessary modules and models
const express = require("express");
const router = express.Router();
const { Hospital } = require("../models/UserModels");

// GET /api/hospital/:id
router.get("/:id", async (req, res) => {
  try {
    const hospitalId = req.params.id;
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Return the hospital data
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to update a hospital
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, picture, address, contactNumber } = req.body;

  try {
    // Find the hospital by ID
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Update the hospital information
    hospital.name = name;
    hospital.email = email;
    hospital.picture = picture;
    hospital.address = address;
    hospital.contactNumber = contactNumber;

    // Save the updated hospital
    const updatedHospital = await hospital.save();

    res.json(updatedHospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
