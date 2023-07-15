const express = require("express");
const router = express.Router();
const availableSlotController = require("../controller/availableSlotController");

// Route for creating an available slot
router.post("/", availableSlotController.createAvailableSlot);

// Route for retrieving all available slots
router.get("/", availableSlotController.getAllAvailableSlots);

// Route for retrieving available slots by doctor ID
router.get(
  "/doctors/:doctorId",
  availableSlotController.getAvailableSlotsByDoctorId
);

// Route for updating an available slot
router.put("/:slotId", availableSlotController.updateAvailableSlot);
// Route for updating status an available slot
router.put("/book/:slotId", availableSlotController.updateStatusAvailableSlot);
// Route for deleting an available slot
router.delete("/:slotId", availableSlotController.deleteAvailableSlot);

module.exports = router;
