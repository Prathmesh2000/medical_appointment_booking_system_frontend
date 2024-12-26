import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LayoutHOC from "./common/LayoutHOC";
import { createAppointment, fetchDoctorData } from "../services/api";
import { CircleLoader } from "react-spinners";
import { useSelector } from "react-redux";
// import { bookAppointment, fetchDoctorDetails } from "../services/api";

const AppointmentBookingPage = ({selectedDateForAppointment, setSelectedDateForAppointment}) => {
  const commonStateData = useSelector(state=>state?.commonData || {});
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(commonStateData?.seletedBookingDate || '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedDates = queryParams.get('data');
  const [selectedSlot, setSelectedSlot] = useState();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Parse query parameters
  const doctorId = queryParams.get('doctor'); // Replace 'myParam' with your query param key


  useEffect(() => {
      const loadDoctorDetails = async () => {
      try {

        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month as getMonth() is 0-based
        const day = date.getDate().toString().padStart(2, '0'); // Pad with leading zeros if needed
        const formattedDate = `${year}-${month}-${day}`;
        let response = {};
        if(commonStateData?.userName){
          response = await fetchDoctorData(doctorId, formattedDate);
        }
        setDoctor((prev)=> {
          if(response?.availableSlots?.length>0) {
            return response
          } else {
            return {...prev, availableSlots: []}
          }
        });
      } catch (err) {
        setDoctor((prev)=>{
          return {...prev, availableSlots: []}
        });
        setError("Failed to fetch doctor details. Please try again.");
      }
    };

    loadDoctorDetails();
  }, [selectedDate])

  const handleBooking = async () => {
    const responce = await createAppointment({
      doctorId: doctorId, 
      patientName: commonStateData?.userName || '', 
      date: selectedDate, 
      timeSlot: selectedSlot
    })

    if(responce){
      navigate("/dashboard");
    } else {
      setError("Failed to book the appointment. Please try again with diffrent date.");
    }

    return
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Book Appointment
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {doctor ? (
          <>
            <h2 className="text-xl font-semibold mb-2">
              Dr. {doctor.name} - {doctor.specialty}
            </h2>
            <h3 className="text-xl font-semibold mb-2">
              {doctor.qualification}
            </h3>
            {/* <p className="text-gray-600 mb-4">
              Availability: {doctor.availability ? "Available" : "Unavailable"}
            </p> */}

            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                }}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {selectedDate && (
              <div className="mb-4">
                <label
                  htmlFor="time-slot"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Time Slot
                </label>
                <select
                  id="time-slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select a time slot</option>
                  {doctor?.availableSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleBooking}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              disabled={!selectedDate || !selectedSlot}
            >
              Book Appointment
            </button>
          </>
        ) : (
          <div className="flex justify-center items-center py-6">
            <CircleLoader color="#3b82f6" loading={true} size={50} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutHOC(AppointmentBookingPage);
