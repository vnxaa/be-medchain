const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AvailableSlot",
      required: true,
    },
    code: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
