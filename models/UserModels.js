const mongoose = require("mongoose");

// Base user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      enum: ["hospital", "patient", "doctor", "staff"],
      required: true,
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
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});

// Patient schema
const patientSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["nam", "nữ"],
  },
  fatherName: {
    type: String,
  },
  motherName: {
    type: String,
  },
  fatherContact: {
    type: String,
  },
  motherContact: {
    type: String,
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
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
  email: {
    type: String,
    required: true,
    unique: true,
  },
  medicalRecordsProvider: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
    },
  ],
});

// Staff schema
const staffSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["nam", "nữ"],
  },
  status: {
    type: String,
    enum: ["approve", "reject"],
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
  email: {
    type: String,
    required: true,
    unique: true,
  },
  citizenId: {
    type: String,
  },
});

// Create models based on the discriminator field
const User = mongoose.model("User", userSchema);
const Hospital = User.discriminator("hospital", hospitalSchema);
const Patient = User.discriminator("patient", patientSchema);
const Doctor = User.discriminator("doctor", doctorSchema);
const Staff = User.discriminator("staff", staffSchema);

module.exports = {
  User,
  Hospital,
  Patient,
  Doctor,
  Staff,
};
