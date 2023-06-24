const express = require("express");
const router = express.Router();
const hospitalController = require("../controller/hospitalController");

// Route to get a hospital by ID
router.get("/:id", hospitalController.getHospitalById);

// Route to update a hospital
router.put("/update/:id", hospitalController.updateHospital);

module.exports = router;
