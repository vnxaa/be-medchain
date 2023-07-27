const AccountRequest = require("../models/AccountRequest");
const { Staff, Patient, Doctor } = require("../models/UserModels");
const moment = require("moment");
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
const getTotalUser = async (req, res) => {
  try {
    const staffCount = await Staff.countDocuments();
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();

    res.json({
      staffCount,
      patientCount,
      doctorCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const getDoctorAccountRequestStatistics = async (req, res) => {
  try {
    // Query the database to get the statistics
    const doctorAccountRequests = await AccountRequest.find({ role: "doctor" });

    // Calculate the total count of doctor account requests for each status
    const pendingCount = doctorAccountRequests.filter(
      (request) => request.status === "pending"
    ).length;
    const approvedCount = doctorAccountRequests.filter(
      (request) => request.status === "approved"
    ).length;
    const rejectedCount = doctorAccountRequests.filter(
      (request) => request.status === "rejected"
    ).length;

    // Return the statistics as a JSON response
    res.json({ pendingCount, approvedCount, rejectedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const getStaffAccountRequestStatistics = async (req, res) => {
  try {
    // Query the database to get the statistics
    const staffAccountRequests = await AccountRequest.find({ role: "staff" });

    // Calculate the total count of staff account requests for each status
    const pendingCount = staffAccountRequests.filter(
      (request) => request.status === "pending"
    ).length;
    const approvedCount = staffAccountRequests.filter(
      (request) => request.status === "approved"
    ).length;
    const rejectedCount = staffAccountRequests.filter(
      (request) => request.status === "rejected"
    ).length;

    // Return the statistics as a JSON response
    res.json({ pendingCount, approvedCount, rejectedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPatientGenderCounts = async (req, res) => {
  try {
    const patients = await Patient.find();

    // Initialize an object to store the arrays for each gender
    const genderCounts = {
      male: [null, null, null, null],
      female: [null, null, null, null],
    };

    // Calculate the age group for each patient and increment the corresponding count
    patients.forEach((patient) => {
      const age = moment().diff(patient.birthday, "years");
      if (age >= 0 && age <= 14) {
        if (age >= 0 && age <= 2) {
          patient.gender === "nam"
            ? genderCounts.male[0]++
            : genderCounts.female[0]++;
        } else if (age >= 3 && age <= 6) {
          patient.gender === "nam"
            ? genderCounts.male[1]++
            : genderCounts.female[1]++;
        } else if (age >= 7 && age <= 10) {
          patient.gender === "nam"
            ? genderCounts.male[2]++
            : genderCounts.female[2]++;
        } else if (age >= 11 && age <= 14) {
          patient.gender === "nam"
            ? genderCounts.male[3]++
            : genderCounts.female[3]++;
        }
      }
    });

    res.json(genderCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getDoctorGenderCounts = async (req, res) => {
  try {
    const doctors = await Doctor.find();

    // Initialize an object to store the arrays for each gender
    const genderCounts = {
      male: [null, null, null, null, null],
      female: [null, null, null, null, null],
    };

    // Calculate the age group for each doctor and increment the corresponding count
    doctors.forEach((doctor) => {
      const age = moment().diff(doctor.birthday, "years");
      if (age >= 18 && age <= 25) {
        doctor.gender === "nam"
          ? (genderCounts.male[0] += 1)
          : (genderCounts.female[0] += 1);
      } else if (age >= 26 && age <= 35) {
        doctor.gender === "nam"
          ? (genderCounts.male[1] += 1)
          : (genderCounts.female[1] += 1);
      } else if (age >= 36 && age <= 45) {
        doctor.gender === "nam"
          ? (genderCounts.male[2] += 1)
          : (genderCounts.female[2] += 1);
      } else if (age >= 46 && age <= 55) {
        doctor.gender === "nam"
          ? (genderCounts.male[3] += 1)
          : (genderCounts.female[3] += 1);
      } else if (age >= 56 && age <= 60) {
        doctor.gender === "nam"
          ? (genderCounts.male[4] += 1)
          : (genderCounts.female[4] += 1);
      }
    });

    res.json(genderCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getStaffGenderCounts = async (req, res) => {
  try {
    const staffMembers = await Staff.find();

    // Initialize an object to store the arrays for each gender
    const genderCounts = {
      male: [null, null, null, null, null],
      female: [null, null, null, null, null],
    };

    // Calculate the age group for each staff member and increment the corresponding count
    staffMembers.forEach((staff) => {
      const age = moment().diff(staff.birthday, "years");
      if (age >= 18 && age <= 25) {
        staff.gender === "nam"
          ? (genderCounts.male[0] += 1)
          : (genderCounts.female[0] += 1);
      } else if (age >= 26 && age <= 35) {
        staff.gender === "nam"
          ? (genderCounts.male[1] += 1)
          : (genderCounts.female[1] += 1);
      } else if (age >= 36 && age <= 45) {
        staff.gender === "nam"
          ? (genderCounts.male[2] += 1)
          : (genderCounts.female[2] += 1);
      } else if (age >= 46 && age <= 55) {
        staff.gender === "nam"
          ? (genderCounts.male[3] += 1)
          : (genderCounts.female[3] += 1);
      } else if (age >= 56 && age <= 60) {
        staff.gender === "nam"
          ? (genderCounts.male[4] += 1)
          : (genderCounts.female[4] += 1);
      }
    });

    res.json(genderCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  createAccountRequest,
  getAllAccountRequests,
  getAccountRequestById,
  getAccountRequestsByRole,
  updateAccountRequestStatus,
  getTotalUser,
  getDoctorAccountRequestStatistics,
  getStaffAccountRequestStatistics,
  getPatientGenderCounts,
  getDoctorGenderCounts,
  getStaffGenderCounts,
};
