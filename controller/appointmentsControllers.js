const Appointment = require("../models/Appointment");
const AvailableSlot = require("../models/AvailableSlot");
const { Patient, Doctor } = require("../models/UserModels");
const Barcode = require("jsbarcode");
const { createCanvas } = require("canvas");
const nodemailer = require("nodemailer");
const moment = require("moment");

const generateCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomCharacter = characters.charAt(
    Math.floor(Math.random() * characters.length)
  );
  const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); // Generates a 10-digit random number
  const code = `${randomCharacter}${randomNumber}`;

  // Check if the generated code already exists in appointments
  const existingAppointment = await Appointment.findOne({
    code,
    status: "confirmed",
  });

  // If the code already exists, regenerate a new code
  if (existingAppointment) {
    return generateCode(); // Recursive call to generate a new code
  }

  return code;
};
const generateBarcodeImage = async (code) => {
  const canvas = createCanvas(200, 100);
  Barcode(canvas, code, { format: "CODE128", displayValue: false });
  // Convert the canvas to a PNG buffer
  const buffer = canvas.toBuffer("image/png");

  return buffer;
};

// Function to calculate the booking rate for a specific day
async function calculateBookingRate(doctorId, dayOfWeek) {
  // Get the start and end dates of the day (from 00:00 to 23:59)
  const startDate = moment().isoWeekday(dayOfWeek).startOf("day");
  const endDate = moment().isoWeekday(dayOfWeek).endOf("day");

  // Find all confirmed appointments for the doctor within the day
  const confirmedAppointments = await Appointment.find({
    doctor: doctorId,
    status: "confirmed",
  }).populate("slot");

  const filteredAppointments = confirmedAppointments.filter((appointment) => {
    // Check if the appointment has a valid slot and if its date falls within the specified day
    return (
      appointment.slot !== null &&
      moment(appointment.slot.date).isBetween(startDate, endDate, null, "[]")
    );
  });
  // console.log("confirmedAppointments", filteredAppointments.length);

  // Find all available slots for the doctor within the day
  const availableSlots = await AvailableSlot.find({
    doctor: doctorId,
    date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
  });
  // console.log("availableSlots", availableSlots.length);
  // Calculate the booking rate for the day
  const bookingRate =
    (filteredAppointments.length / availableSlots.length) * 100;

  return isNaN(bookingRate) ? 0 : bookingRate;
}
const appointmentController = {
  makeAppointment: async (req, res) => {
    try {
      const { patientId, doctorId, slotId } = req.body;

      // Check if the selected slot is available
      const slot = await AvailableSlot.findById(slotId);

      if (!slot || slot.isBooked) {
        return res
          .status(404)
          .json({ success: false, message: "Selected slot is not available" });
      }

      // Create a new appointment instance
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        slot: slotId,
        status: "pending",
      });

      // Mark the slot as booked
      slot.isBooked = true;
      await slot.save();

      // Save the appointment to the database
      await appointment.save();

      res.status(201).json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.find();
      res.json({ success: true, appointments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentsByPatientId: async (req, res) => {
    try {
      const { patientId } = req.params;

      // Find appointments by patient ID
      const appointments = await Appointment.find({
        patient: patientId,
      });

      res.json({ success: true, appointments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentsByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;

      // Find appointments by doctor ID
      const appointments = await Appointment.find({
        doctor: doctorId,
      }).populate("slot");

      res.json({ success: true, appointments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  updateAppointmentStatus: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;

      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      // Update the appointment status
      appointment.status = status;
      appointment.previous_status = "pending";
      // Save the updated appointment to the database
      await appointment.save();

      res.json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  approveAppointment: async (req, res) => {
    try {
      const { appointmentId } = req.params;

      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }
      const patientId = appointment.patient;
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found" });
      }
      const doctorId = appointment.doctor;
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }
      // Update the appointment status to "approved"
      appointment.status = "confirmed";
      appointment.previous_status = "pending";
      // Update the appointment code
      const code = await generateCode();
      appointment.code = code;

      // Save the updated appointment to the database
      await appointment.save();

      // Get the slot ID from the appointment
      const slotId = appointment.slot;

      // Find the available slot by ID
      const slot = await AvailableSlot.findById(slotId);

      if (!slot) {
        return res
          .status(404)
          .json({ success: false, message: "Available slot not found" });
      }

      // Mark the slot as booked
      slot.isBooked = true;
      await slot.save();

      // Generate the barcode image
      const barcodeImageBuffer = await generateBarcodeImage(code);
      // Send appointment information to the user's email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.user,
          pass: process.env.pass,
        },
      });
      // console.log(patient.email);
      const mailOptions = {
        from: "medchaincompany@gmail.com",
        to: "chuong100621@gmail.com, vnxa01@gmail.com", // Replace with the user's email address
        subject: "Đặt lịch khám thành công",
        html: `
        

        <!doctype html>
        <html lang="en-US">
        
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Đặt khám thành công</title>
            <meta name="description" content="Appointment Reminder Email Template">
        </head>
        <style>
            a:hover {text-decoration: underline !important;}
        </style>
        
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
            <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                <tr>
                    <td>
                        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                            align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="height:80px;">&nbsp;</td>
                            </tr>
                            <!-- Logo -->
                            <tr>
                                <td style="text-align:center;">
                                <img width="60" src="https://i.ibb.co/qmTw3hp/logo.png" title="logo" alt="logo">
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <!-- Email Content -->
                            <tr>
                                <td>
                                    <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                        style="max-width:670px; background:#fff; border-radius:3px;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);padding:0 40px;">
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                        <!-- Title -->
                                        <tr>
                                            <td style="padding:0 15px; text-align:center;">
                                                <h1 style="color:#1e1e2d; font-weight:400; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Phiếu khám bệnh</h1>
                                                <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; 
                                                width:100px;"></span>
                                            </td>
                                        </tr>
                                        <!-- Details Table -->
                                        <tr>
                                            <td>
                                                <table cellpadding="0" cellspacing="0"
                                                    style="width: 100%; border: 1px solid #ededed">
                                                    <tbody>
                                                      
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Bệnh nhân</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${
                                                                  patient.name
                                                                }</td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Bác sĩ</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${
                                                                  doctor.name
                                                                }</td>
                                                        </tr>
                                                                                                      <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Bệnh viện</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                Bệnh Viện Phụ Sản - Nhi Đà Nẵng</td>
                                                        </tr>
                                                         <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Địa chỉ</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                402 Lê Văn Hiến, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng</td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed;border-right: 1px solid #ededed; width: 35%; font-weight:500; color:rgba(0,0,0,.64)">
                                                                Dịch vụ</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                Khám tim bẩm sinh</td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 10px;  border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%;font-weight:500; color:rgba(0,0,0,.64)">
                                                                Ngày khám</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056;">
                                                                ${new Date(
                                                                  slot?.date
                                                                ).toLocaleDateString(
                                                                  "en-GB"
                                                                )}
                                                                </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; border-right: 1px solid #ededed; width: 35%;font-weight:500; color:rgba(0,0,0,.64)">
                                                                Giờ khám</td>
                                                            <td
                                                                style="padding: 10px; border-bottom: 1px solid #ededed; color: #455056; ">
                                                                ${new Date(
                                                                  slot?.startTime
                                                                ).toLocaleTimeString()} - ${new Date(
          slot?.endTime
        ).toLocaleTimeString()}
                                    
                                                              
                                                                </td>
                                                        </tr>
                                                    
                                                    </tbody>
                                                </table>
                                                <div style="text-align: center;">
                                                <img src="cid:barcodeImage" alt="Barcode" style="display: block; margin: 0 auto;"/>
                                              </div>
                                            </td>
                                       
                                        </tr>
                                     
                                        <tr>
                                            <td style="height:40px;">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="height:20px;">&nbsp;</td>
                            </tr>
                            <tr>
                              
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>
        `,
        attachments: [
          {
            filename: "barcode.png",
            content: barcodeImageBuffer,
            cid: "barcodeImage", // Set the CID (Content ID) of the attachment to be used in the email body
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send email" });
        } else {
          console.log("Email sent:", info.response);
          res.json({ success: true, appointment });
        }
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentById: async (req, res) => {
    try {
      const { appointmentId } = req.params;

      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId).populate(
        "slot"
      );

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      res.json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentByCode: async (req, res) => {
    try {
      const { appointmentCode } = req.params;

      // Find the appointment by code
      const appointment = await Appointment.findOne({
        code: appointmentCode,
      }).populate("slot");

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      res.json({ success: true, appointment });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getAppointmentBookingRate: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const bookingRates = [];

      // Calculate booking rate for each day of the week (from Monday to Sunday)
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const bookingRate = await calculateBookingRate(doctorId, dayOfWeek);
        bookingRates.push(bookingRate);
      }

      res.json({ success: true, bookingRates });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getPendingAppointmentsForCurrentWeek: async (req, res) => {
    try {
      const pendingAppointments = await Appointment.find({
        status: "pending",
      }).populate("slot");

      // Group appointments by day of the week
      const pendingAppointmentsByDay = {};
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const startDate = moment().isoWeekday(dayOfWeek).startOf("day");
        const endDate = moment().isoWeekday(dayOfWeek).endOf("day");

        const appointmentsForDay = pendingAppointments.filter((appointment) => {
          return (
            appointment.slot !== null &&
            moment(appointment.slot.date).isBetween(
              startDate,
              endDate,
              null,
              "[]"
            )
          );
        });

        pendingAppointmentsByDay[dayOfWeek] = appointmentsForDay.length;
      }

      // Format the result to match the desired output
      const formattedData = [];
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        formattedData.push(pendingAppointmentsByDay[dayOfWeek]);
      }

      res.json({ success: true, data: formattedData });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getConfirmedAndCancelledAppointmentsForCurrentWeek: async (req, res) => {
    try {
      const confirmedAppointments = await Appointment.find({
        status: "confirmed",
      }).populate("slot");

      const cancelledAppointments = await Appointment.find({
        status: "cancelled",
      }).populate("slot");

      const data = [];

      let totalConfirmedAppointments = 0;
      let totalCancelledAppointments = 0;
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const startDate = moment().isoWeekday(dayOfWeek).startOf("day");
        const endDate = moment().isoWeekday(dayOfWeek).endOf("day");

        const filteredConfirmedAppointments = confirmedAppointments.filter(
          (appointment) => {
            // Check if the appointment has a valid slot and if its date falls within the specified day
            return (
              appointment.slot !== null &&
              moment(appointment.slot.date).isBetween(
                startDate,
                endDate,
                null,
                "[]"
              )
            );
          }
        );
        totalConfirmedAppointments += filteredConfirmedAppointments.length;
        const filteredCancelledAppointments = cancelledAppointments.filter(
          (appointment) => {
            // Check if the appointment has a valid slot and if its date falls within the specified day
            return (
              appointment.slot !== null &&
              moment(appointment.slot.date).isBetween(
                startDate,
                endDate,
                null,
                "[]"
              )
            );
          }
        );
        totalCancelledAppointments += filteredCancelledAppointments.length;
      }
      data[0] = totalConfirmedAppointments;
      data[1] = totalCancelledAppointments;
      res.json({ success: true, data: data });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
  getConfirmedAppointmentsByPatientId: async (req, res) => {
    try {
      const { patientId } = req.params;

      // Find all confirmed appointments for the given patient ID
      const confirmedAppointments = await Appointment.find({
        patient: patientId,
        status: "confirmed",
      }).populate("doctor slot");

      res.json({ success: true, data: confirmedAppointments });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = appointmentController;
