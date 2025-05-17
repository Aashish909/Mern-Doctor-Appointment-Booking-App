import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          Contact <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12 px-6 md:px-12">
        <img
          className="w-full md:max-w-[360px] rounded-md shadow-md"
          src={assets.contact_image}
          alt="About"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4  text-gray-600">
          <b>OUR OFFICE</b>
          <p>
            54709 Wilms Station <br /> Suite 350 , Washington, USA
          </p>
          <p>
            Tel: (123)456-7890 <br />
            Email: prescripto@gmail.com
          </p>
          <h2 className="text-xl font-semibold mt-4">Career at Prescripto</h2>
          <p>Learn more about our teams and job openings.</p>
          <button className="px-4 py-2 text-md border border-gray-400 rounded hover:bg-gray-700 hover:text-white transition-all duration-300 w-fit">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
