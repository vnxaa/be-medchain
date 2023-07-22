const Appointment = require("../models/Appointment");
const AvailableSlot = require("../models/AvailableSlot");
const { Patient } = require("../models/UserModels");
const nodemailer = require("nodemailer");
const generateCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomCharacter = characters.charAt(
    Math.floor(Math.random() * characters.length)
  );
  const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); // Generates a 10-digit random number
  return `${randomCharacter}${randomNumber}`;
};
const appointmentController = {
  makeAppointment: async (req, res) => {
    try {
      const { patientId, doctorId, slotId } = req.body;

      // Check if the selected slot is available
      const slot = await AvailableSlot.findById(slotId);

      if (!slot || slot.isBooked) {
        return res
          .status(404)
          .json({ success: false, message: "Selected slot is not available" });
      }

      // Create a new appointment instance
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        slot: slotId,
        status: "pending",
      });

      // Mark the slot as booked
      slot.isBooked = true;
      await slot.save();

      // Save the appointment to the database
      await appointment.save();

      res.status(201).json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.find();
      res.json({ success: true, appointments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentsByPatientId: async (req, res) => {
    try {
      const { patientId } = req.params;

      // Find appointments by patient ID
      const appointments = await Appointment.find({
        patient: patientId,
      });

      res.json({ success: true, appointments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentsByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;

      // Find appointments by doctor ID
      const appointments = await Appointment.find({
        doctor: doctorId,
      }).populate("slot");

      res.json({ success: true, appointments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  updateAppointmentStatus: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      // Update the appointment status
      appointment.status = status;

      // Save the updated appointment to the database
      await appointment.save();

      res.json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  approveAppointment: async (req, res) => {
    try {
      const { appointmentId } = req.params;

      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }
      const patientId = appointment.patient;
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found" });
      }
      console.log(patient.email);
      // Update the appointment status to "approved"
      appointment.status = "confirmed";

      // Update the appointment code
      appointment.code = generateCode();

      // Save the updated appointment to the database
      await appointment.save();

      // Get the slot ID from the appointment
      const slotId = appointment.slot;

      // Find the available slot by ID
      const slot = await AvailableSlot.findById(slotId);

      if (!slot) {
        return res
          .status(404)
          .json({ success: false, message: "Available slot not found" });
      }

      // Mark the slot as booked
      slot.isBooked = true;
      await slot.save();

      // Send appointment information to the user's email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
      });

      const mailOptions = {
        from: "medchaincompany@gmail.com",
        to: "vnxa01@gmail.com", // Replace with the user's email address
        subject: "Appointment Approved",
        html: `
        <h1>Appointment Approved</h1>
        <p>Your appointment has been approved.</p>
        <p>Appointment Details:</p>
        <p>Doctor: ${appointment.doctor}</p>
        <p>Date: ${appointment.date}</p>
        <p>Time: ${appointment.time}</p>
        <p>Location: ${appointment.location}</p>
        <p>Please arrive on time for your appointment.</p>
      `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send email" });
        } else {
          console.log("Email sent:", info.response);
          res.json({ success: true, appointment });
        }
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentById: async (req, res) => {
    try {
      const { appointmentId } = req.params;

      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId).populate(
        "slot"
      );

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      res.json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentByCode: async (req, res) => {
    try {
      const { appointmentCode } = req.params;

      // Find the appointment by code
      const appointment = await Appointment.findOne({
        code: appointmentCode,
      }).populate("slot");

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      res.json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = appointmentController;
