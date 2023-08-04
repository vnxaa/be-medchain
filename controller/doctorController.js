const { Doctor } = require("../models/UserModels");
const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;
const argon2 = require("argon2");
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
const updatePicture = async (req, res) => {
  try {
    const { picture } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { picture },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Create a new JWT token with the updated doctor data
    const updatedToken = jwt.sign(
      { doctor },
      secretKey,
      { expiresIn: "5h" } // Set the token expiration as desired
    );

    res.json({ doctor, token: updatedToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find the doctor by ID
    let doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Compare the current password with the one stored in the database
    const isPasswordMatch = await argon2.verify(
      doctor.password,
      currentPassword
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // Hash the new password before saving it
    const hashedNewPassword = await argon2.hash(newPassword);

    // Update the doctor's password with the new hashed password
    doctor.password = hashedNewPassword;

    // Save the updated doctor
    doctor = await doctor.save();

    const updatedToken = jwt.sign(
      { doctor },
      secretKey,
      { expiresIn: "5h" } // Set the token expiration as desired
    );

    res.json({
      success: true,
      message: "Password updated successfully",
      token: updatedToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateDoctorInformation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, gender, contactNumber, citizenId, email, birthday } =
      req.body;

    // Validate the required fields
    if (
      !name ||
      !address ||
      !gender ||
      !contactNumber ||
      !citizenId ||
      !email ||
      !birthday
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Find the doctor by ID
    let doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Update doctor information with the provided data only if the field has changed
    if (name !== doctor.name) {
      doctor.name = name;
    }
    if (address !== doctor.address) {
      doctor.address = address;
    }
    if (gender !== doctor.gender) {
      doctor.gender = gender;
    }
    if (contactNumber !== doctor.contactNumber) {
      doctor.contactNumber = contactNumber;
    }
    if (citizenId !== doctor.citizenId) {
      doctor.citizenId = citizenId;
    }
    if (email !== doctor.email) {
      doctor.email = email;
    }
    if (birthday !== doctor.birthday) {
      doctor.birthday = birthday;
    }

    // Save the updated doctor information
    doctor = await doctor.save();

    const updatedToken = jwt.sign(
      { doctor },
      secretKey,
      { expiresIn: "5h" } // Set the token expiration as desired
    );

    res.json({ doctor, token: updatedToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  updatePicture,
  updatePassword,
  updateDoctorInformation,
};
