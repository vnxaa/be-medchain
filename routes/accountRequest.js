const express = require("express");
const router = express.Router();
const accountRequestController = require("../controller/accountRequestController");

// Route to create a new account request
router.post("/", accountRequestController.createAccountRequest);

// Route to get all account requests
router.get("/", accountRequestController.getAllAccountRequests);

// Route to get a single account request by ID
router.get("/:id", accountRequestController.getAccountRequestById);

// Route to get account requests by role
router.get("/role/:role", accountRequestController.getAccountRequestsByRole);

// Route to update the status of an account request
router.put("/status/:id", accountRequestController.updateAccountRequestStatus);

module.exports = router;
