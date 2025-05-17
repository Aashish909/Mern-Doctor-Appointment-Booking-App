import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, getDoctorsData, backendUrl, token } =
    useContext(AppContext);
  const { userData } = useContext(AppContext);
  const dayOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState("");
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };
  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  // available slot
  // const getAvailableSlot =async()=>{
  //   setDocSlot([])

  //   //getting currrent data
  //   let today = new Date()

  //   for(let i =0; i<7;i++){
  //     //get date with slotIndex
  //     let currentDate = new Date(today)
  //     currentDate.setDate(today.getDate()+i)

  //     //setting end time of the date  with slotIndex
  //     let endTime = new Date();
  //     endTime.setDate(today.getDate()+i)

  //     endTime.setHours(21,0,0,0)

  //     //setting setHours
  //     if(today.getDate()=== currentDate.getDate()){
  //       currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours()+ 1 : 10)
  //       currentDate.setMinutes(currentDate.setMinutes()> 30? 30: 0)
  //     }
  //       else{
  //         currentDate.setHours(10)
  //         currentDate.setMinutes(0)
  //       }

  //       let timeSlots =[];

  //       while( currentDate < endTime){
  //         let formattedTime = currentDate.toLocaleDateString([], {hour: '2-digit', minute  : '2-digit'})

  //         //add slot to array
  //         timeSlots.push({
  //           dateTime: new Date(currentDate),
  //           time:formattedTime
  //         })

  //         //increement currrent time by 30 minute
  //         currentDate.setMinutes(currentDate.getMinutes()+30)
  //       }

  //       setDocSlot(prev=> ([...prev, timeSlots]))
  //   }
  // }

  const getAvailableSlot = async () => {
    setDocSlots([]); // Reset slot array

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0); // Set end time to 9:00 PM

      // Set start time
      if (i === 0) {
        // Today: Start from the next possible 30-min slot >= current time or 10:00 AM
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        currentDate.setHours(Math.max(now.getHours(), 10));
        currentDate.setMinutes(now.getMinutes() > 30 ? 0 : 30);
      } else {
        // Future days: Start at 10:00 AM
        currentDate.setHours(10, 0, 0, 0);
      }

      const timeSlots = [];

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          // Add slot to array
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      // Append to docSlot for each day
      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  // const bookAppointment = async () => {
  //   if (!token) {
  //     toast.error("Please login to book an appointment");
  //     return navigate("/login");
  //   }

  //   try {
  //     const date =docSlot[slotIndex][0].dateTime

  //     let day =date.getDate()
  //     let month = date.getMonth() + 1;
  //     let year = date.getFullYear()

  //     const slotDate =day +"_"+ month + "_" + year

  //     const {data}= await axios.post(
  //       backendUrl + "/api/user/book-appointment",
  //       {
  //          docId,
  //         slotDate,
  //      slotTime,
  //       },
  //       {
  //         headers: { token },
  //       }
  //     );

  //     if(data.success) {
  //       toast.success("Appointment booked successfully");
  //       getDoctorsData();
  //       navigate("/my-appointments");
  //     } else{
  //       toast.error(data.message);
  //     }

  //   } catch (error) {

  //     console.error(error);
  //     toast.error("Failed to book appointment. Please try again.");
  //   }
  // };

  const bookAppointment = async () => {
    if (!token) {
      toast.error("Please login to book an appointment");
      return navigate("/login");
    }

    try {
      // const rawDate = docSlot[slotIndex][0].dateTime; // this is a string
      // const date = new Date(rawDate); // now it's a Date object
      const date = docSlots[slotIndex][0].dateTime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;
      console.log("slot date: ", slotDate);

      console.log("DocId: ", docId);
      console.log("Backend URl: ", backendUrl);

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        {
          docId,
          slotDate,
          slotTime,
          userId: userData._id,
          userData: userData,
        },
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success("Appointment booked successfully");
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(
        "Error booking appointment: ",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    }
  };

  useEffect(() => {
    getAvailableSlot();
  }, [docInfo]);

  useEffect(() => {
    console.log("doct slots: ", docSlots);
  }, [docSlots]);
  return (
    docInfo && (
      <div>
        {/* Doctor Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="w-full bg-indigo-400 sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* Doc Info (name, degree, exp) */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full ">
                {docInfo.experience}
              </button>
            </div>
            {/* Doctor About */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* /Booking slot */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 ">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center  w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  key={index}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-indigo-500 text-white  "
                      : "border border-gray-300"
                  }`}
                >
                  <p>{item[0] && dayOfWeek[item[0].dateTime.getDay()]}</p>
                  <p>{item[0] && item[0].dateTime.getDate()}</p>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3  w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  key={index}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400 border border-gray-300"
                  }`}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            className="bg-indigo-500 text-white text-sm font-light px-14 py-3 rounded-full my-6"
          >
            Book an appointment
          </button>
        </div>
        {/* Related Doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
