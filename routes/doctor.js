const express = require("express");
const router = express.Router();
const doctorController = require("../controller/doctorController");

// Route to get all doctors
router.get("/getAll", doctorController.getAllDoctors);

// Route to get a doctor by ID
router.get("/:id", doctorController.getDoctorById);

// Route to update a doctor
router.put("/update/:id", doctorController.updateDoctor);

module.exports = router;
