import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import doctorModel from "../models/doctorModel.js";

import jwt from "jsonwebtoken";
import appointmentModel from "../models/AppointmentModel.js";
import userModel from "../models/userModel.js";

//API for adding doctor

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      speciality,
      email,
      password,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // console.log({
    //   name,
    //   speciality,
    //   email,
    //   password,
    //   degree,
    //   experience,
    //   about,
    //   fees,
    //   address,
    // },imageFile);

    //checking for all data to add doctor
    if (
      !name ||
      !speciality ||
      !email ||
      !password ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    //validating email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }

    //validating  strong password
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 5 characters long.",
      });
    }

    //hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    //creating doctor object
    const doctorData = {
      name,
      speciality,
      email,
      password: hashedPassword,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      image: imageUrl,
      date: Date.now(),
    };

    //saving doctor to database
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res
      .status(201)
      .json({ success: true, message: "Doctor added successfully." });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API for admin login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check for required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      //generate jwt token
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // //check if user exists
    // const admin = await adminModel.findOne({ email });
    // if (!admin) {
    //     return res.status(401).json({ success: false, message: "Invalid credentials." });
    // }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API for getting all doctors
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error." });
  }
};

//API  for appointment cancel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId, userId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found." });
    }
    //verify user
    // if (appointmentData.userId !== userId) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "You are not authorized." });
    // }

    //verify user

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing doctor Slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    const slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const appointments = await appointmentModel.find({});
    const users = await userModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
