import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge } = useContext(AppContext);

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="text-lg font-medium mb-3">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {/* Header for desktop */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 p-3 border-b px-6 text-gray-600 font-medium">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.reverse().map((item, index) => {
          const user = item.userData || {};
          return (
            <div
              key={index}
              className="grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] grid-cols-1 sm:gap-1 gap-2 p-4 border-b px-6 items-center text-gray-500 hover:bg-gray-50"
            >
              <p className="sm:block hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={user.image || assets.default_avatar}
                  alt="Patient"
                />
                <p>{user.name || "Unknown"}</p>
              </div>
              <p
                className={`text-xs font-medium px-3 py-1 rounded-full inline-block
                      ${
                        item.payment
                          ? "text-green-800 bg-green-100 border border-green-300"
                          : "text-red-800 bg-red-100 border border-red-300"
                      }
                    `}
              >
                {item.payment ? "Paid" : "Not Paid"}
              </p>

              <p>{user.dob ? calculateAge(user.dob) : "N/A"}</p>
              <p>
                {item.slotDate} - {item.slotTime}
              </p>
              <p>&#8377; {item.amount}</p>

              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-400 text-xs font-medium">Completed</p>
              ) : (
                <div className="flex gap-2">
                  <img
                    onClick={() => cancelAppointment(item._id, item.docId)}
                    src={assets.cancel_icon}
                    alt="Cancel"
                    className="w-10 h-10 cursor-pointer"
                  />
                  <img
                    onClick={() =>
                      completeAppointment(item._id, item.docData._id)
                    }
                    src={assets.tick_icon}
                    alt="Confirm"
                    className="w-10 h-10 cursor-pointer"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorAppointments;
