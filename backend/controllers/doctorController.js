import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/AppointmentModel.js";
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required." });
    }

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }

    docData.available = !docData.available;
    await docData.save();

    res
      .status(200)
      .json({ success: true, message: "Availability changed successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password." });
    }
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API to get doctor appointments for doctor panel

const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.doctorId; // ✅ Correct way to get the ID

    if (!docId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access." });
    }

    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error("appointmentsDoctor error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API to mark appointment complete for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { appointmentId, docId } = req.body;
    console.log("appointmentId:", appointmentId, "docId:", docId);
    console.log(appointmentId, docId);
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment completed." });
    } else {
      res.status(404).json({ success: false, message: "Mark Failed." });
    }
  } catch (error) {
    console.error("appointmentComplete error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId, docId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment cancelled." });
    } else {
      res.status(404).json({ success: false, message: "Cancellation Failed." });
    }
  } catch (error) {
    console.error("appointmentComplete error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

// //API to get dashboard data for doctor panel
// const doctorDashboard = async (req, res) => {
//   try {

//     const { docId } = req.body;
//     console.log("Received docId:", req.body.docId || req.query.docId);

//     const appointments = await appointmentModel.find({ docId });

//     let earnings = 0;

//     appointments.forEach((item) => {
//       if (item.isCompleted || item.payment) {
//         earnings += item.amount;
//       }
//     });

//     const patients = [];
//     appointments.forEach((item) => {
//       if (patients.includes(item.userId)) {
//         patients.push(item.userId);
//       }
//     });

//     const dashData = {
//       earnings,
//       appointments: appointments.length,
//       patients: patients.length,
//       latestAppointments: appointments.reverse().slice(0, 5),
//     };
//     res.json({ success: true, dashData });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: error.message || "Server Error." });
//   }
// };

//from windSurf which is correct
const doctorDashboard = async (req, res) => {
  try {
    const dToken = req.headers.dtoken;
    if (!dToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access." });
    }

    const decoded = jwt.verify(dToken, process.env.JWT_SECRET);

    const docId = decoded.id;
    console.log("Received docId:", docId);

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    const patientSet = new Set();

    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
      if (!patientSet.has(item.userId)) {
        patientSet.add(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patientSet.size,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
  try {
     const dToken = req.headers.dtoken;
     if (!dToken) {
       return res
         .status(401)
         .json({ success: false, message: "Unauthorized access." });
     }

     const decoded = jwt.verify(dToken, process.env.JWT_SECRET);

     const docId = decoded.id;
     console.log("Received docId:", docId);
    // const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select(["-password"]);
    res.json({ success: true, profileData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API to update doctor profile data
const updateDoctorProfile = async (req, res) => {
  try {
     const dToken = req.headers.dtoken;
     if (!dToken) {
       return res
         .status(401)
         .json({ success: false, message: "Unauthorized access." });
     }

     const decoded = jwt.verify(dToken, process.env.JWT_SECRET);

     const docId = decoded.id;
    const {  fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      available,
    });
    res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//module.exports = changeAvailability;
export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
