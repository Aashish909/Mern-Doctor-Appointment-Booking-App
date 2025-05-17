import express from 'express';
import cors from 'cors';

import 'dotenv/config';
import connectDB from './config/mongoDB.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

//app config
const app = express();

const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();

//middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

//app.use(express.urlencoded({ extended: true })); // for parsing form data

// api endpoints
app.use('/api/admin', adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/user", userRouter)



//localhost:4000/api/admin/add-doctor

app.get('/', (req, res) => {
    res.send('Hello from the backend server again hi aginnnn!')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
