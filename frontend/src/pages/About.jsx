import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      {/* About Us Section */}
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12 px-6 md:px-12">
        <img
          className="w-full md:max-w-[360px] rounded-md shadow-md"
          src={assets.about_image}
          alt="About"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            <strong>Welcome to Prescripto</strong> — your trusted partner in
            modern healthcare. At Prescripto, we are dedicated to making
            healthcare more accessible, efficient, and patient-centric through
            technology. Our platform bridges the gap between patients and
            healthcare providers, ensuring timely care and hassle-free
            appointments.
          </p>
          <p>
            Prescripto is committed to empowering individuals with seamless
            access to medical consultations, e-prescriptions, and specialist
            care—all from the comfort of their homes. We believe in simplifying
            complex healthcare systems and placing control back in the hands of
            the users.
          </p>
          <h2 className="text-xl font-semibold mt-4">Our Vision</h2>
          <p>
            Our vision at Prescripto is to revolutionize healthcare delivery by
            integrating innovation, compassion, and technology. We aim to become
            the go-to platform for every individual seeking trusted healthcare
            support—quickly, securely, and transparently.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          WHY <span className="text-gray-700 font-medium">CHOOSE US</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row mb-20 gap-6 mt-8 px-6 md:px-12">
        {[
          {
            title: "Efficiency",
            content:
              "Prescripto streamlines the entire healthcare experience — from booking appointments to receiving prescriptions.",
          },
          {
            title: "Convenience",
            content:
              "With just a few clicks, users can consult certified doctors, access medical records, and manage prescriptions from anywhere.",
          },
          {
            title: "Personalization",
            content:
              "We tailor your healthcare journey based on your needs, history, and preferences.",
          },
        ].map((card, index) => (
          <div
            key={index}
            className="border rounded-xl px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-indigo-300 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer shadow-sm"
          >
            <b>{card.title}:</b>
            <p>{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
