import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LayoutHOC from "./common/LayoutHOC";
import { fetchAvailableDoctor } from "../services/api";
import { convertTo12HourFormat } from "../utils/commonfunc";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CircleLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { setCommonData } from "../redux/commonDataSlice";

const DoctorListPage = ({ updateSelectedDateForAppointment }) => {
  const [doctors, setDoctors] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [specialtySuggestions, setSpecialtySuggestions] = useState([]);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize directly with today
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const filteredDoctors = useMemo(() => {
    const lowercasedName = nameSearch.toLowerCase();
    const lowercasedSpecialty = specialtySearch.toLowerCase();

    return doctors.filter((doctor) => {
      const matchesName = doctor.name.toLowerCase().includes(lowercasedName);
      const matchesSpecialty = doctor.specialty
        .toLowerCase()
        .includes(lowercasedSpecialty);

      return matchesName && matchesSpecialty;
    });
  }, [nameSearch, specialtySearch, doctors]);

  const fetchDoctors = useCallback(async (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    setLoading(true);
    try {
      const response = await fetchAvailableDoctor(formattedDate);
      setDoctors(response);
    } catch (err) {
      setError("Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSpecialtySuggestions = useCallback(() => {
    const uniqueSpecialties = [...new Set(doctors.map((doc) => doc.specialty.toLowerCase()))];
    setSpecialtySuggestions(
      uniqueSpecialties.filter((specialty) =>
        specialty.includes(specialtySearch.toLowerCase())
      )
    );
  }, [specialtySearch, doctors]);

  const handleBookAppointment = useCallback(
    (doctorId) => {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      dispatch(setCommonData({ key: "seletedBookingDate", value: formattedDate }));
      navigate(`/book-appointment?doctor=${doctorId}`);
    },
    [selectedDate, dispatch, navigate]
  );

  useEffect(() => {
    fetchDoctors(selectedDate);
  }, [selectedDate, fetchDoctors]);

  useEffect(() => {
    handleSpecialtySuggestions();
  }, [specialtySearch, handleSpecialtySuggestions]);

  const formattedAvailability = useCallback((availability) => {
    return Object.entries(availability)
      .map(([day, times]) => {
        const formattedTimes = times
          .map((time) => {
            const [start, end] = time.split("-");
            return `${convertTo12HourFormat(start)} - ${convertTo12HourFormat(end)}`;
          })
          .join(", ");
        return `${day} (${formattedTimes})`;
      })
      .join(", ");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Available Doctors</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-6">
            <CircleLoader color="#3b82f6" loading={loading} size={50} />
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="relative">
            <input
              type="text"
              placeholder="Search by specialty..."
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {specialtySearch && specialtySuggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-gray-300 rounded shadow mt-1 max-h-40 overflow-auto z-10">
                {specialtySuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => setSpecialtySearch(suggestion)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Select a Date
            </label>
            <DatePicker
              id="date"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholderText="Select a date"
            />
          </div>
        </div>

        {!loading && (
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <p className="text-gray-600">No doctors available for your search.</p>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <div
                  key={`${doctor.name}_${index}`}
                  className="border p-4 rounded shadow-sm hover:shadow-md transition"
                >
                  <h2 className="text-lg font-semibold">{doctor.name}</h2>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <p className="text-sm text-gray-600">Availability: {formattedAvailability(doctor.availability)}</p>
                  <button
                    onClick={() => handleBookAppointment(doctor.id)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Book Appointment
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutHOC(DoctorListPage);