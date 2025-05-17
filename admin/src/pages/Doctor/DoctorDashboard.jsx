import React from "react";
import { useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useEffect } from "react";
import { assets } from "../../assets/assets";

const DoctorDashboard = () => {
  const {
    getDashData,
    dashData,
    setDashData,
    dToken,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);
  return (
    dashData && (
      <div>
        <div className="m-5">
          <div className="flex flex-wrap gap-3 ">
            <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
              <img className="w-14" src={assets.earning_icon} alt="" />
              <div>
                <p className="text-xl font-semibold text-gray-600">
                  ₹ {dashData.earnings}
                </p>
                <p className="text-gray-400 ">Earnings</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
              <img className="w-14" src={assets.appointments_icon} alt="" />
              <div>
                <p className="text-xl font-semibold text-gray-600">
                  {dashData.appointments}
                </p>
                <p className="text-gray-400 ">Appointments</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
              <img className="w-14" src={assets.patients_icon} alt="" />
              <div>
                <p className="text-xl font-semibold text-gray-600">
                  {dashData.patients}
                </p>
                <p className="text-gray-400 ">Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white">
            <div className="flex items-center gap-2.5 p-3 border-b py-4 px-4 mt-10 rounded-t border">
              <img src={assets.list_icon} alt="" />
              <p className="font-semibold">Latest Appointments</p>
            </div>

            <div className="pt-4 border border-t-0">
              {dashData.latestAppointments.map((item, index) => (
                <div
                  className="flex items-center hover:bg-gray-100 gap-3 py-3 px-6"
                  key={index}
                >
                  <img
                    className="w-10 rounded-full"
                    src={item.userData.image}
                    alt=""
                  />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium">
                      {item.userData.name}
                    </p>
                    <p className="text-gray-500">{item.slotDate}</p>
                  </div>
                  {item.cancelled ? (
                    <p className="text-red-400 text-xs font-medium">
                      Cancelled
                    </p>
                  ) : item.isCompleted ? (
                    <p className="text-green-400 text-xs font-medium">
                      Completed
                    </p>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorDashboard;
