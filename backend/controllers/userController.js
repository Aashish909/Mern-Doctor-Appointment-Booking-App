import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/AppointmentModel.js";
import razorpay from "razorpay";

//APi to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 5 characters long.",
      });
    }
    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //save user to database
    const userData = { name, email, password: hashedPassword };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    //generate jwt token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to login user

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User doest not exist." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Api to get user Profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Api to update user profile data
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    const userId = req.userId; // from middleware

    if (!name || !phone || !dob || !gender) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    let updatedFields = {
      name,
      phone,
      dob,
      gender,
    };

    if (address) {
      updatedFields.address = JSON.parse(address);
    }

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updatedFields.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }

    if (!docData.available) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor is not available." });
    }

    let slots_booked = docData.slots_booked;

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res
          .status(400)
          .json({ success: false, message: "Slot is not available." });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    // if (!userData) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "User not found." });
    // }

    delete docData.slots_booked; // optional (be careful here)

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in doctor document
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment booked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to get user appointments  for frontend mu-appointmnest page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to cancel appointmnet
const cancelAppointment = async (req, res) => {
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

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//API to make payment using razorpay
// const paymentRazorpay = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);

//     if (!appointmentData || appointmentData.cancelled) {
//       return res.status(400).json({
//         success: false,
//         message: "Appointment cancelled or not found.",
//       });
//     }

//     //creating options for razorpay
//     const options = {
//       amount: appointmentData.amount * 100, // amount in paise
//       currency: "INR",
//       receipt: appointmentId,
//     };
//     //createing order
//     const order = await razorpayInstance.orders.create(options);
//     res.json({ success: true, order });
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     const message =
//       error?.error?.description || error.message || "Something went wrong.";
//     res.status(500).json({ success: false, message });
//   }
// };
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    console.log("Received appointmentId:", appointmentId);

    const appointmentData = await appointmentModel.findById(appointmentId);
    console.log("Appointment Data:", appointmentData);

    if (!appointmentData || appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment cancelled or not found.",
      });
    }

    if (typeof appointmentData.amount !== "number") {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment amount.",
      });
    }

    //creating options for razorpay
    const options = {
      amount: appointmentData.amount * 100, // amount in paise
      currency: "INR",
      receipt: appointmentId,
    };
    console.log("Creating Razorpay order with options:", options);

    //creating order
    const order = await razorpayInstance.orders.create(options);
    console.log("Razorpay order created:", order);

    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    const message =
      error?.error?.description || error.message || "Something went wrong.";
    res.status(500).json({ success: false, message });
  }
};

//API to verify payment of Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({ success: true, message: "Payment verified successfully." });
    } else {
      res.json({ success: false, message: "Payment not verified." });
    }
  } catch (error) {
    console.error("Razorpay Error:", error);
    const message =
      error?.error?.description || error.message || "Something went wrong.";
    res.status(500).json({ success: false, message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
