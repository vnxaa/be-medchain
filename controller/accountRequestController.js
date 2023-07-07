const AccountRequest = require("../models/AccountRequest");

// Controller to create a new account request
const createAccountRequest = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, role } = req.body;

    // Create a new account request
    const accountRequest = new AccountRequest({
      fullName,
      email,
      phoneNumber,
      role,
    });

    // Save the account request
    await accountRequest.save();

    res
      .status(201)
      .json({ success: true, message: "Account request created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to get all account requests
const getAllAccountRequests = async (req, res) => {
  try {
    const accountRequests = await AccountRequest.find();
    res.status(200).json(accountRequests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller to get a single account request by ID
const getAccountRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const accountRequest = await AccountRequest.findById(id);

    if (!accountRequest) {
      return res.status(404).json({ error: "Account request not found" });
    }

    res.status(200).json(accountRequest);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
// Controller to get account requests by role
const getAccountRequestsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const accountRequests = await AccountRequest.find({ role });

    if (accountRequests.length === 0) {
      return res
        .status(404)
        .json({ error: "No account requests found for the specified role" });
    }

    res.status(200).json(accountRequests);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateAccountRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the account request by ID
    const accountRequest = await AccountRequest.findById(id);

    if (!accountRequest) {
      return res.status(404).json({ error: "Account request not found" });
    }

    // Update the status
    accountRequest.status = status;

    // Save the updated account request
    await accountRequest.save();

    res.json({ message: "Account request status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  createAccountRequest,
  getAllAccountRequests,
  getAccountRequestById,
  getAccountRequestsByRole,
  updateAccountRequestStatus,
};
