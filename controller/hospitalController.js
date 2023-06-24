const { Hospital } = require("../models/UserModels");

// Get a hospital by ID
const getHospitalById = async (req, res) => {
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
};

// Update a hospital
const updateHospital = async (req, res) => {
  const { id } = req.params;
  const { name, email, picture, address, contactNumber } = req.body;

  try {
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.name = name;
    hospital.email = email;
    hospital.picture = picture;
    hospital.address = address;
    hospital.contactNumber = contactNumber;

    const updatedHospital = await hospital.save();
    res.json(updatedHospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getHospitalById,
  updateHospital,
};
