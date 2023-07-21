const { Staff } = require("../models/UserModels");
const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;
const argon2 = require("argon2");
const staffController = {
  updatePicture: async (req, res) => {
    try {
      const { picture } = req.body;
      const staff = await Staff.findByIdAndUpdate(
        req.params.id,
        { picture },
        { new: true }
      );

      if (!staff) {
        return res.status(404).json({ error: "Staff not found" });
      }

      // Create a new JWT token with the updated staff data
      const updatedToken = jwt.sign(
        { staff },
        secretKey,
        { expiresIn: "5h" } // Set the token expiration as desired
      );

      res.json({ staff, token: updatedToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  updateStaffInformation: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        gender,
        contactNumber,
        citizenId,
        email,
        birthday,
      } = req.body;

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
      // Find the staff by ID
      let staff = await Staff.findById(id);

      if (!staff) {
        return res.status(404).json({ error: "Staff not found" });
      }

      // Update staff information with the provided data only if the field has changed
      if (name !== staff.name) {
        staff.name = name;
      }
      if (address !== staff.address) {
        staff.address = address;
      }
      if (gender !== staff.gender) {
        staff.gender = gender;
      }
      if (contactNumber !== staff.contactNumber) {
        staff.contactNumber = contactNumber;
      }
      if (citizenId !== staff.citizenId) {
        staff.citizenId = citizenId;
      }
      if (email !== staff.email) {
        staff.email = email;
      }
      if (birthday !== staff.birthday) {
        staff.birthday = birthday;
      }

      // Save the updated staff information
      staff = await staff.save();

      const updatedToken = jwt.sign(
        { staff },
        secretKey,
        { expiresIn: "5h" } // Set the token expiration as desired
      );

      res.json({ staff, token: updatedToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Find the staff by ID
      let staff = await Staff.findById(id);

      if (!staff) {
        return res.status(404).json({ error: "Staff not found" });
      }

      // Compare the current password with the one stored in the database
      const isPasswordMatch = await argon2.verify(
        staff.password,
        currentPassword
      );

      if (!isPasswordMatch) {
        return res.status(401).json({ error: "Incorrect current password" });
      }

      // Hash the new password before saving it
      const hashedNewPassword = await argon2.hash(newPassword);

      // Update the staff's password with the new hashed password
      staff.password = hashedNewPassword;

      // Save the updated staff
      staff = await staff.save();

      const updatedToken = jwt.sign(
        { staff },
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
  },
  getStaffById: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the staff by ID
      const staff = await Staff.findById(id);

      if (!staff) {
        return res.status(404).json({ error: "Staff not found" });
      }

      res.json({ staff });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getAllStaff: async (req, res) => {
    try {
      // Find all staff
      const staff = await Staff.find();

      res.json({ staff });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = staffController;
