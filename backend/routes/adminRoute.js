import express from "express";

import {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  adminDashboard,
} from "../controllers/adminController.js";

import upload from "../middlerwares/multer.js";
import authAdmin from "../middlerwares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";
import { cancelAppointment } from "../controllers/userController.js";

const adminRouter = express.Router();

// // 'imageFile' is the key used in Postman/form-data
// adminRouter.post('/add-doctor', upload.single('imageFile'), addDoctor); //middleware for file upload

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

adminRouter.post("/login", loginAdmin); // API for admin login

adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointment);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
