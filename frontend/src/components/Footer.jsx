import React from 'react'
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm ">
        {/* Left side */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6 ">
            Prescripto is your trusted platform for booking appointments with
            top-rated doctors. Browse specialists, check real-time availability,
            and schedule your visit in just a few clicks — anytime, anywhere.
            Healthcare made simple and accessible.
          </p>
        </div>
        {/* Center */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        {/* Right side */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+123 456 7890</li>
            <li>prescripto@gmail.com</li>
          </ul>
        </div>
      </div>
      {/* Copyright */}
      <div >
        <hr className=" border-gray-300"  />
        <p className='py-5 text-sm text-center'>
          Copyright &copy; {new Date().getFullYear()} Prescripto – All Rights
          Reserved
        </p>
      </div>
    </div>
  );
}

export default Footer