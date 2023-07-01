const Appointment = require("../models/Appointment");
const appointmentController = {
  makeAppointment: async (req, res) => {
    try {
      const { patientId, doctorId, appointmentDate, startTime, endTime } =
        req.body;

      // Create a new appointment instance
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        appointmentDate,
        startTime,
        endTime,
      });

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
      const { patientId, doctorId } = req.params;

      // Find appointments by patient ID
      const appointments = await Appointment.find({
        patient: patientId,
        doctor: doctorId,
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
      const appointments = await Appointment.find({ doctor: doctorId });

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
};

module.exports = appointmentController;
