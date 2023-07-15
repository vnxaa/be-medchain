const Appointment = require("../models/Appointment");
const AvailableSlot = require("../models/AvailableSlot");
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

      // Update the appointment status to "approved"
      appointment.status = "approved";

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
