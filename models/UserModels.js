const mongoose = require("mongoose");

// Base user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ["hospital", "patient", "doctor"],
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { discriminatorKey: "role" }
);

// Hospital schema
const hospitalSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

// Patient schema
const patientSchema = new mongoose.Schema({
  picture: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["nam", "nữ"],
  },
  birthday: {
    type: Date,
  },
  address: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  guardianCitizenId: {
    type: String,
  },
  socialInsuranceId: {
    type: String,
  },
  medicalRecordsOwner: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
    },
  ],
  admissionDate: {
    type: Date,
  },
  dischargeDate: {
    type: Date,
  },
});

// Doctor schema
const doctorSchema = new mongoose.Schema({
  picture: {
    type: String,
  },
  specialization: {
    type: String,
    default: "Nhi Khoa",
  },
  gender: {
    type: String,
    enum: ["nam", "nữ"],
  },
  status: {
    type: String,
    enum: ["approve", "wait", "reject"],
  },
  birthday: {
    type: Date,
  },
  address: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  citizenId: {
    type: String,
  },
  medicalRecordsProvider: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
    },
  ],
});

// Create models based on the discriminator field
const User = mongoose.model("User", userSchema);
const Hospital = User.discriminator("hospital", hospitalSchema);
const Patient = User.discriminator("patient", patientSchema);
const Doctor = User.discriminator("doctor", doctorSchema);

module.exports = {
  User,
  Hospital,
  Patient,
  Doctor,
};
