const AvailableSlot = require("../models/AvailableSlot");

const availableSlotController = {
  createAvailableSlot: async (req, res) => {
    try {
      const { doctorId, date, startTime, endTime } = req.body;

      // Create a new available slot instance
      const availableSlot = new AvailableSlot({
        doctor: doctorId,
        date,
        startTime,
        endTime,
        isBooked: false,
      });

      // Save the available slot to the database
      await availableSlot.save();

      res.status(201).json({ success: true, availableSlot });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAllAvailableSlots: async (req, res) => {
    try {
      const availableSlots = await AvailableSlot.find().populate("doctor");
      res.json({ success: true, availableSlots });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAvailableSlotsByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;

      // Find available slots by doctor ID
      const availableSlots = await AvailableSlot.find({ doctor: doctorId });

      res.json({ success: true, availableSlots });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  updateStatusAvailableSlot: async (req, res) => {
    try {
      const { slotId } = req.params;
      const { isBooked } = req.body;

      // Find the available slot by ID
      const availableSlot = await AvailableSlot.findById(slotId);

      if (!availableSlot) {
        return res
          .status(404)
          .json({ success: false, message: "Available slot not found" });
      }

      // Update the status of the available slot
      availableSlot.isBooked = isBooked;

      // Save the updated available slot to the database
      await availableSlot.save();

      res.json({ success: true, availableSlot });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  updateAvailableSlot: async (req, res) => {
    try {
      const { slotId } = req.params;
      const { date, startTime, endTime } = req.body;

      // Find the available slot by ID
      const availableSlot = await AvailableSlot.findById(slotId);

      if (!availableSlot) {
        return res
          .status(404)
          .json({ success: false, message: "Available slot not found" });
      }

      // Update the available slot fields
      availableSlot.date = date;
      availableSlot.startTime = startTime;
      availableSlot.endTime = endTime;

      // Save the updated available slot to the database
      await availableSlot.save();

      res.json({ success: true, availableSlot });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  deleteAvailableSlot: async (req, res) => {
    try {
      const { slotId } = req.params;

      // Delete the available slot from the database
      const result = await AvailableSlot.deleteOne({ _id: slotId });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Available slot not found" });
      }

      res.json({
        success: true,
        message: "Available slot deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = availableSlotController;
