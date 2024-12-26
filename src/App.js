import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import DoctorListPage from './components/DoctorListPage';
import AppointmentBookingPage from './components/AppointmentBookingPage';
import UserDashboard from './components/UserDashboard';

function App() {
  const [selectedDateForAppointment, setSelectedDateForAppointment] = useState(new Date());
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/doctors" element={
              <DoctorListPage
                updateSelectedDateForAppointment={((val)=>{setSelectedDateForAppointment(val)})}
              />
            } 
           />
          <Route path="/book-appointment" element={
            <AppointmentBookingPage 
              seletedDateForAppointment={selectedDateForAppointment} 
              updateSelectedDateForAppointment={((val)=>{setSelectedDateForAppointment(val)})} 
              />
            } 
          />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
    </Router>
  );
}

export default App;
