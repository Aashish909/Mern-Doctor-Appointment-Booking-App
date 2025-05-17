import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({docId, speciality}) => {

    const {doctors} =useContext(AppContext)
    const navigate=useNavigate()

    const [relDoc, setRelDoc] =useState([])

    useEffect(()=>{
        if(doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc)=> doc.speciality === speciality && doc._id !== docId )
            setRelDoc(doctorsData)
        }
    },[speciality, doctors, docId])


  return (
    <div className="flex flex-col items-center gap-4 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Related Doctors</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Grid Section */}
      <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 px-3 sm:px-0">
        {relDoc.slice(0, 5).map((item, index) => (
          <div
        onClick={() => {navigate(`/appointment/${item._id}`); scrollTo(0,0)}}
            key={index}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <img
              className="bg-blue-50 w-full h-48 object-cover"
              src={item.image}
              alt={item.name}
            />
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <p>Available</p>
              </div>
              <p className="font-medium text-base">{item.name}</p>
              <p className="text-sm text-gray-600">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-blue-100 text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        More
      </button>
    </div>
  );
}

export default RelatedDoctors