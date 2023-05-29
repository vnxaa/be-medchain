const jwt = require("jsonwebtoken");

const verifyHospitalToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access token not found" });

  try {
    const decoded = jwt.verify(token, process.env.secretKey);

    if (decoded.hospital.role == "hospital") {
      next();
    } else {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ success: false, message: "Invalid tokenss" });
  }
};

module.exports = verifyHospitalToken;
