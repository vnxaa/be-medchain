const RejectReason = require("../models/RejectReason");

const rejectReasonController = {
  createRejectReason: async (req, res) => {
    try {
      const { medicalRecordId, reason } = req.body;

      // Create a new reject reason instance
      const rejectReason = new RejectReason({
        medicalRecordId: medicalRecordId,
        reason,
      });

      // Save the reject reason to the database
      await rejectReason.save();

      res.status(201).json({ success: true, rejectReason });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create reject reason" });
    }
  },
  getRejectReasonByMedicalRecordId: async (req, res) => {
    try {
      const medicalRecordId = req.params.medicalRecordId;

      // Find the reject reason by medicalRecordId
      const rejectReason = await RejectReason.find({ medicalRecordId });

      if (!rejectReason) {
        return res
          .status(404)
          .json({ success: false, message: "Reject reason not found" });
      }

      res.json({ success: true, rejectReason });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve reject reason" });
    }
  },

  getRejectReasonById: async (req, res) => {
    try {
      const rejectReasonId = req.params.id;

      // Find the reject reason by ID
      const rejectReason = await RejectReason.findById(rejectReasonId);

      if (!rejectReason) {
        return res
          .status(404)
          .json({ success: false, message: "Reject reason not found" });
      }

      res.json({ success: true, rejectReason });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve reject reason" });
    }
  },

  getAllRejectReasons: async (req, res) => {
    try {
      // Retrieve all reject reasons
      const rejectReasons = await RejectReason.find();

      res.json({ success: true, rejectReasons });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve reject reasons" });
    }
  },

  updateRejectReason: async (req, res) => {
    try {
      const rejectReasonId = req.params.id;
      const { reason } = req.body;

      // Find the reject reason by ID
      const rejectReason = await RejectReason.findById(rejectReasonId);

      if (!rejectReason) {
        return res
          .status(404)
          .json({ success: false, message: "Reject reason not found" });
      }

      // Update the reject reason
      rejectReason.reason = reason;
      await rejectReason.save();

      res.json({ success: true, rejectReason });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update reject reason" });
    }
  },

  deleteRejectReason: async (req, res) => {
    try {
      const rejectReasonId = req.params.id;

      // Find the reject reason by ID and remove it
      const rejectReason = await RejectReason.findByIdAndRemove(rejectReasonId);

      if (!rejectReason) {
        return res
          .status(404)
          .json({ success: false, message: "Reject reason not found" });
      }

      res.json({ success: true, message: "Reject reason deleted" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete reject reason" });
    }
  },
};

module.exports = rejectReasonController;
