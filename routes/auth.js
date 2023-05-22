const express = require("express");
const router = express.Router();
const { verifyMessage } = require("ethers");
const jwt = require("jsonwebtoken");
const { User, Doctor, Patient, Hospital } = require("../models/UserModels");
const verifyHospitalToken = require("../middleware/auth");
const secretKey = process.env.secretKey;

// Login endpoint for patient
router.post("/patient/login", async (req, res) => {
  const { walletAddress, message, sign } = req.body;

  try {
    // Verify the signature
    const recoveredAddress = verifyMessage(message, sign);
    if (recoveredAddress !== walletAddress) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    let patient = await Patient.findOne({ walletAddress });

    // If the user doesn't exist, create a new user with the "patient" role
    if (!patient) {
      patient = new Patient({
        walletAddress,
      });
      await patient.save();
    }

    // Generate JWT token
    const token = jwt.sign({ recoveredAddress, patient }, secretKey, {
      expiresIn: "5h",
    });
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);

    // Return the JWT token
    res.json(token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login", error });
  }
});

// Login endpoint for hospitals
router.post("/hospital/login", async (req, res) => {
  const { walletAddress, message, sign } = req.body;

  try {
    // Verify the signature
    const recoveredAddress = verifyMessage(message, sign);
    if (recoveredAddress !== walletAddress) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    let hospital = await Hospital.findOne({ walletAddress });

    // If the user doesn't exist, create a new user with the "hospital" role
    // if (!hospital) {
    //   hospital = new Hospital({
    //     walletAddress,
    //     name: "Bệnh Viện Phụ Sản - Nhi Đà Nẵng",
    //     address: "402 Lê Văn Hiến, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng",
    //     email: "benhvienphusannhi@danang.gov.vn",
    //     phoneNumber: "0236.3957.777",
    //   });
    //   await hospital.save();
    // }
    // If the user doesn't exist, return an error
    if (!hospital) {
      return res.status(401).json({ error: "Hospital not found" });
    } else {
      // Generate JWT token
      const token = jwt.sign({ recoveredAddress, hospital }, secretKey, {
        expiresIn: "5h",
      });
      // Return the JWT token
      res.json(token);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login", error });
  }
});
// Login endpoint for doctor
router.post("/doctor/login", async (req, res) => {
  const { walletAddress, message, sign } = req.body;

  try {
    // Verify the signature
    const recoveredAddress = verifyMessage(message, sign);

    if (recoveredAddress !== walletAddress) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    let doctor = await Doctor.findOne({ walletAddress });

    // Create a new doctor if it doesn't exist
    if (!doctor) {
      doctor = new Doctor({
        walletAddress,
        status: "wait", // Set the initial status as 'wait'
      });

      // Save the new doctor to the database
      await doctor.save();

      return res.json({ status: "Doctor account is pending approval" });
    }

    if (doctor.status === "reject") {
      return res.json({ status: "Doctor account is rejected" });
    } else if (doctor.status === "wait") {
      return res.json({ status: "Doctor account is pending approval" });
    } else if (doctor.status === "approve") {
      // Generate JWT token with doctor's role and wallet address
      const token = jwt.sign({ walletAddress, doctor }, secretKey, {
        expiresIn: "5h",
      });

      res.json(token);
    }
  } catch (error) {
    console.error("Failed to create doctor:", error);
    res.status(500).json({ error: "Failed to create doctor" });
  }
});

router.put("/doctor/status", verifyHospitalToken, async (req, res) => {
  const { walletAddress, status } = req.body;

  try {
    // Find the doctor based on the wallet address
    const doctor = await Doctor.findOne({ walletAddress });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Update the doctor's status
    doctor.status = status;
    await doctor.save();

    res.json({ status: "success" });
  } catch (error) {
    console.error("Failed to update doctor status:", error);
    res.status(500).json({ error: "Failed to update doctor status" });
  }
});

module.exports = router;
