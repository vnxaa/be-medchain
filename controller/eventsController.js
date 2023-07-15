const AvailableSlot = require("../models/AvailableSlot");
const Appointment = require("../models/Appointment");
const moment = require("moment");
const eventsController = {
  getEventsForDoctorByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;

      // Find available slots that are not booked and belong to the specified doctor
      // and have a start time greater than or equal to the current time
      const availableSlots = await AvailableSlot.find({
        isBooked: false,
        doctor: doctorId,
        startTime: { $gte: moment().startOf("day").toDate() },
      });

      // Retrieve appointments for the specified doctor with pending or confirmed status
      const appointments = await Appointment.find({
        doctor: doctorId,
        status: { $in: ["pending", "confirmed"] },
      }).populate("slot");

      // Filter available slots based on matching appointments
      //   const combinedResults = [...availableSlots, ...appointments];

      res.json({ success: true, appointments, availableSlots });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getEventsForPatientByDoctorIdAndPatientId: async (req, res) => {
    try {
      const { doctorId, patientId } = req.params;
      if (!doctorId || !patientId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing doctorId or patientId" });
      }
      // Find available slots that are not booked and belong to the specified doctor
      // and have a start time greater than or equal to the current time
      const availableSlots = await AvailableSlot.find({
        isBooked: false,
        doctor: doctorId,
        startTime: { $gte: moment().startOf("day").toDate() },
      });

      // Retrieve appointments for the specified doctor and patient with success, pending, or cancel status
      const appointments = await Appointment.find({
        doctor: doctorId,
        patient: patientId,
      }).populate("slot");

      // Filter available slots based on the canceled or pending appointments
      const filteredAvailableSlots = availableSlots.filter((slot) => {
        const matchingAppointments = appointments.filter(
          (appointment) =>
            appointment.slot &&
            appointment.slot._id.toString() === slot._id.toString() &&
            (appointment.status === "pending" ||
              appointment.status === "cancelled")
        );

        // Check if any matching appointment is in pending status
        const hasPendingAppointment = matchingAppointments.some(
          (appointment) => appointment.status === "pending"
        );

        // Exclude the slot if it has a pending appointment or a canceled appointment
        return !hasPendingAppointment && matchingAppointments.length === 0;
      });

      res.json({
        success: true,
        availableSlots: filteredAvailableSlots,
        appointments,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getEventsForStaffByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;

      // Retrieve available slots for the specified doctor
      // and have a start time greater than or equal to the current time
      const availableSlots = await AvailableSlot.find({
        isBooked: false,
        doctor: doctorId,
        startTime: { $gte: moment().startOf("day").toDate() },
      });

      // Retrieve appointments for the specified doctor with confirmed or pending status
      const appointments = await Appointment.find({
        doctor: doctorId,
        status: { $in: ["confirmed", "pending"] },
      }).populate("slot");

      // Extract the start times of appointments
      const appointmentTimes = appointments.map(
        (appointment) => appointment?.slot?.startTime
      );

      // Filter available slots to exclude those with the same start time as any appointments
      const filteredAvailableSlots = availableSlots.filter(
        (slot) => !appointmentTimes.includes(slot?.startTime)
      );

      res.json({
        success: true,
        appointments,
        availableSlots: filteredAvailableSlots,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = eventsController;
