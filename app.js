const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth");
const doctorRouter = require("./routes/doctor");
const patientRouter = require("./routes/patient");
const hospitalRouter = require("./routes/hospital");
const medicalRecordsRouter = require("./routes/medicalRecords");
const appointmentRouter = require("./routes/appointment");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@medchain.kzptg74.mongodb.net/?retryWrites=true&w=majority`
    );

    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/hospital", hospitalRouter);
app.use("/api/medicalRecord", medicalRecordsRouter);
app.use("/api/appointment", appointmentRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
