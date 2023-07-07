const express = require("express");
const router = express.Router();
const rejectReasonController = require("../controller/rejectReasonController");

// Route to create a new reject reason
router.post("/", rejectReasonController.createRejectReason);

// Route to get a reject reason by ID
router.get("/:id", rejectReasonController.getRejectReasonById);

// Route to get all reject reasons
router.get("/", rejectReasonController.getAllRejectReasons);

// Route to update a reject reason
router.put("/:id", rejectReasonController.updateRejectReason);

// Route to delete a reject reason
router.delete("/:id", rejectReasonController.deleteRejectReason);
router.get(
  "/medicalRecord/:medicalRecordId",
  rejectReasonController.getRejectReasonByMedicalRecordId
);

module.exports = router;
