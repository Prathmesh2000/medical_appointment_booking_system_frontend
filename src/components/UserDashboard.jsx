// UserDashboard.js
import React, { useEffect, useState } from "react";
import LayoutHOC from "./common/LayoutHOC";
import { deleteAppointment, fetchAppointment, fetchDoctorData, updateAppointment } from "../services/api";
import { Dialog } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CircleLoader } from "react-spinners";
import { useSelector } from "react-redux";

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editTimeSlot, setEditTimeSlot] = useState("");
  const [editTimeSlotOptions, setEditTimeSlotOptions] = useState([]);
  const commonStateData = useSelector(state=>state?.commonData || {});


  useEffect(()=>{
    setTimeout(()=>{
      setSuccess("")
      setError("")
    }, 300)
  }, [appointments])

  useEffect(() => {
    setLoading(true);
    (async () => {
      if(commonStateData?.userName){
        try {
          const response = await fetchAppointment({ patientName: commonStateData?.userName });
          setAppointments(response);
        } catch (err) {
          setError("Failed to fetch appointments. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [commonStateData?.userName]);

  const handleDelete = async (appointmentId) => {
    try {
      const response = await deleteAppointment({ appointmentID: appointmentId });
      const { status, msg } = response;
      if (status) {
        setSuccess(msg);
        setAppointments((prev) =>
          prev.filter((appointment) => appointment._id !== appointmentId)
        );
      } else {
        setError("Failed to delete appointment. Please try again.");
      }
    } catch (err) {
      setError("Failed to delete appointment. Please try again.");
    }
  };

  const handleEdit = async (appointment) => {
    const appointmentDate = new Date(appointment.date);

    const date = new Date(appointmentDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month as getMonth() is 0-based
    const day = date.getDate().toString().padStart(2, '0'); // Pad with leading zeros if needed
    const formattedDate = `${year}-${month}-${day}`;
   
    const responce = await fetchDoctorData(appointment?.doctorId?.["_id"], formattedDate);
    const {availableSlots=[], } = responce;
    setSelectedAppointment(appointment);
    setEditDate(date);
    setEditTimeSlotOptions([...availableSlots]);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const date = new Date(editDate)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month as getMonth() is 0-based
    const day = date.getDate().toString().padStart(2, '0'); // Pad with leading zeros if needed
    const formattedDate = `${year}-${month}-${day}`;
    // Save logic here
    const response = await updateAppointment({ 
      appointmentID: selectedAppointment._id, 
      date: formattedDate, 
      timeSlot: editTimeSlot
    });
    const { status, msg } = response;

    if(status){
      const updatedAppointments = appointments.map((appt) => {
        if (appt._id === selectedAppointment._id) {
          return { ...appt, date: editDate.toISOString().split("T")[0], timeSlot: editTimeSlot };
        }
        return appt;
      });
      setAppointments(updatedAppointments);
      setSuccess(msg || "Appointment updated successfully.");
    } else{
      setError(msg || "Failed to update appointment.");
    }
    setIsModalOpen(false);
  };

  const handleEditDateChange = async (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month as getMonth() is 0-based
    const day = date.getDate().toString().padStart(2, '0'); // Pad with leading zeros if needed
    const formattedDate = `${year}-${month}-${day}`;
   
    const responce = await fetchDoctorData(selectedAppointment?.doctorId?.["_id"], formattedDate);
    const {availableSlots=[], } = responce;
    setEditDate(date);
    setEditTimeSlotOptions([...availableSlots]);

  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white p-4 md:p-6 rounded shadow-md">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-center">My Appointments</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-6">
            <CircleLoader color="#3b82f6" loading={true} size={50} />
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-600 text-center">
            No appointments found. Book your first appointment now!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300 hidden md:table">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Doctor</th>
                  <th className="border border-gray-300 px-4 py-2">Specialty</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Time</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {appointment.doctorId.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {appointment.doctorId.specialty}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {appointment.date}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {appointment.timeSlot}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-300 rounded p-4"
                >
                  <p className="font-bold">Doctor: {appointment.doctorId.name}</p>
                  <p>Specialty: {appointment.doctorId.specialty}</p>
                  <p>Date: {appointment.date}</p>
                  <p>Time: {appointment.timeSlot}</p>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(appointment._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
            <label className="block mb-2">Date</label>
            <DatePicker
              selected={editDate}
              onChange={(date)=>handleEditDateChange(date)}
              className="w-full border border-gray-300 p-2 rounded mb-4"
            />
            <label className="block mb-2">Time Slot</label>
            <select
              value={editTimeSlot}
              onChange={(e) => setEditTimeSlot(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded mb-4"
            >
              <option value="">Select Time Slot</option>
              {
                (editTimeSlotOptions || []).map((val, i )=>{
                  return (
                    <option key={i} value={val}>{val}</option>
                  )
                })
              }
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LayoutHOC(UserDashboard);