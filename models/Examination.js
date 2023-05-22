const mongoose = require("mongoose");

const examinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Examination = mongoose.model("Examination", examinationSchema);

module.exports = Examination;
