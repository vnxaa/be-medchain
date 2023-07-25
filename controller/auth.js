const { verifyMessage } = require("ethers");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const nodemailer = require("nodemailer");
const { User, Doctor, Patient, Hospital } = require("../models/UserModels");
const secretKey = process.env.secretKey;
function generatePassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
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
          picture: "https://ibb.co/k2VPchD",
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
        // const newHospital = new Hospital({
        //   walletAddress,
        //   address: "402 Lê Văn Hiến, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng",
        //   email: "benhvienphusannhi@danang.gov.vn",
        //   phoneNumber: "0236.3957.777",
        //   name: "Bệnh Viện Phụ Sản - Nhi Đà Nẵng",
        // });
        // hospital = await newHospital.save();
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
  resetPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // Check if the user exists with the provided email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate a new random password
      const newPassword = generatePassword(8);

      // Update the user's password with the new password
      user.password = await argon2.hash(newPassword);
      await user.save();

      // Send the new password to the user's email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
      });

      const mailOptions = {
        from: "medchaincompany@gmail.com",
        to: "chuong100621@gmail.com, vnxa01@gmail.com",
        subject: "Password Reset",
        html: `
          <h1>Password Reset</h1>
          <p>Your password has been reset.</p>
          <p>Your new password is: <strong>${newPassword}</strong></p>
          <p>Please login with your new password and change it immediately.</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send email" });
        } else {
          console.log("Email sent:", info.response);
          res.json({ message: "Password reset successful" });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  register: async (req, res) => {
    const { username, password, role, email, contactNumber, name } = req.body;

    // Simple validation
    if (!username || !password || !role || !email || !contactNumber || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing username, password, role , email or contactNumber",
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
        email,
        picture: "https://i.ibb.co/v4CMzJd/default-avatar.png",
        contactNumber,
        name,
      });
      await newUser.save();
      // Send email to the user
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
      });

      const mailOptions = {
        from: "medchaincompany@gmail.com",
        to: "chuong100621@gmail.com, vnxa01@gmail.com",
        subject: "Registration Confirmation",
        html: `
        <h1>Welcome to Our Application</h1>
        <p>Your account has been successfully registered.</p>
        <p>Username: ${username}</p>
        <p>Password: ${password}</p>
        <p>Please keep this information confidential.</p>
      `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

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
  getAllUsernames: async (req, res) => {
    try {
      const usernames = await User.find(
        { role: { $in: ["doctor", "staff"] } },
        "username"
      );
      res.status(200).json(usernames);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = authController;
