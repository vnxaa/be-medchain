const mongoose = require("mongoose");

const rejectReasonSchema = new mongoose.Schema({
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const RejectReason = mongoose.model("RejectReason", rejectReasonSchema);

module.exports = RejectReason;
