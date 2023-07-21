const express = require("express");
const router = express.Router();
const staffController = require("../controller/staffController");

// Route to update picture of staff
router.put("/update-picture/:id", staffController.updatePicture);
// Update staff information
router.put("/:id", staffController.updateStaffInformation);
// Update user password
router.put("/update-password/:id", staffController.updatePassword);
// Get staff by ID
router.get("/:id", staffController.getStaffById);
// Get all staff
router.get("/", staffController.getAllStaff);
module.exports = router;
