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
          picture: "https://i.ibb.co/v4CMzJd/default-avatar.png",
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
        to: "chuong100621@gmail.com, vnxa01@gmail.com, nvh610@gmail.com, lcnguyen21042001@gmail.com",
        subject: "Cấp mật khẩu mới",
        html: `
        <!doctype html>
        <html lang="en-US">
        
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Cấp mật khẩu mới</title>
            <meta name="description" content="Appointment Reminder Email Template">
        </head>
        <style>
            a:hover {text-decoration: underline !important;}
        </style>
        
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                            <!-- Logo -->
                            <tr>
                                <td style="text-align:center;">
                                <img width="60" src="https://i.ibb.co/qmTw3hp/logo.png" title="logo" alt="logo">
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <!-- Email Content -->
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px; background:#fff; border-radius:3px;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);padding:0 40px;">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <!-- Title -->
                                        <tr>
                                            <td style="padding:0 15px; text-align:center;">
                                                <h1 style="color:#1e1e2d; font-weight:400; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Cấp mật khẩu mới</h1>
                                                <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; 
                                                width:100px;"></span>
                                            </td>
                                        </tr>
                                        <!-- Details Table -->
                                        <tr>
                                            <td>
                                                <table cellpadding="0" cellspacing="0"
                                                    style="width: 100%; border: 1px solid #ededed">
                                                    <tbody>
                                                      
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Tên tài khoản</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${user.username}</td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Mật khẩu mới</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${newPassword}</td>
                                                        </tr>
                                                              
                                                    
                                                    </tbody>
                                                </table>
                                              
                                            </td>
                                       
                                        </tr>
                                     
                                        <tr>
                                            <td style="height:40px;">&nbsp;
                                           Vui lòng đăng nhập bằng mật khẩu mới của bạn và thay đổi nó ngay lập tức                                      
                                          </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                              
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>
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
        to: "chuong100621@gmail.com, vnxa01@gmail.com,  nvh610@gmail.com, lcnguyen21042001@gmail.com",
        subject: "Đăng ký tài khoản thành công",
        html: `
        <!doctype html>
        <html lang="en-US">
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Đăng ký tài khoản thành công</title>
            <meta name="description" content="Appointment Reminder Email Template">
        </head>
        <style>
            a:hover {text-decoration: underline !important;}
        </style>
        
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                            <!-- Logo -->
                            <tr>
                                <td style="text-align:center;">
                                <img width="60" src="https://i.ibb.co/qmTw3hp/logo.png" title="logo" alt="logo">
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <!-- Email Content -->
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px; background:#fff; border-radius:3px;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);padding:0 40px;">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <!-- Title -->
                                        <tr>
                                            <td style="padding:0 15px; text-align:center;">
                                                <h1 style="color:#1e1e2d; font-weight:400; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Đăng ký tài khoản thành công</h1>
                                                <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; 
                                                width:100px;"></span>
                                            </td>
                                        </tr>
                                        <!-- Details Table -->
                                        <tr>
                                            <td>
                                                <table cellpadding="0" cellspacing="0"
                                                    style="width: 100%; border: 1px solid #ededed">
                                                    <tbody>
                                                      
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Tên tài khoản</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${username}</td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Mật khẩu</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${password}</td>
                                                        </tr>
                                                              
                                                    
                                                    </tbody>
                                                </table>
                                              
                                            </td>
                                       
                                        </tr>
                                     
                                        <tr>
                                            <td style="height:40px;text-align: center;">&nbsp;
Vui lòng giữ bí mật thông tin này.
                                          </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                            <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                              
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
