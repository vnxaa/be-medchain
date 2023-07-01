const { verifyMessage } = require("ethers");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { User, Doctor, Patient, Hospital } = require("../models/UserModels");
const secretKey = process.env.secretKey;

const authController = {
  patientLogin: async (req, res) => {
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
  },

  hospitalLogin: async (req, res) => {
    const { walletAddress, message, sign } = req.body;

    try {
      // Verify the signature
      const recoveredAddress = verifyMessage(message, sign);
      if (recoveredAddress !== walletAddress) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      let hospital = await Hospital.findOne({ walletAddress });

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
  },

  doctorLogin: async (req, res) => {
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
  },

  updateDoctorStatus: async (req, res) => {
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
  },

  register: async (req, res) => {
    const { username, password, role } = req.body;

    // Simple validation
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing username, password, or role",
      });
    }

    try {
      // Check for existing user
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      // All good
      const hashedPassword = await argon2.hash(password);
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
      });
      await newUser.save();
      // Return token
      const accessToken = jwt.sign({ newUser }, secretKey);

      res.json({
        success: true,
        message: "User created successfully",
        accessToken,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  login: async (req, res) => {
    const { username, password, role } = req.body;
    // Simple validation
    if (!username || !password || !role)
      return res.status(400).json({
        success: false,
        message: "Missing username and/or password, or role",
      });

    try {
      // Check for existing user
      const user = await User.findOne({ username, role });

      if (!user)
        return res.status(400).json({
          success: false,
          message: "Incorrect username, role, or password",
        });

      // Username and role found
      const passwordValid = await argon2.verify(user.password, password);
      if (!passwordValid)
        return res.status(400).json({
          success: false,
          message: "Incorrect username, role, or password",
        });

      // All good
      // Return token
      const accessToken = jwt.sign({ user }, secretKey);

      res.json({
        success: true,
        message: "User logged in successfully",
        accessToken,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = authController;
