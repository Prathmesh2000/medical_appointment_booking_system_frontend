import axios from "axios";

const BASE_URL = 'https://medical-appointment-booking-system-backend.vercel.app';

export async function loginUser ({username=null, password=null}) {
    if(username && password){
        try {
            const responce = await axios.post(`${BASE_URL}/api/auth/login`, {
                "username": username,
                "password": password
            })
            if(responce?.data?.error==0 && responce?.data?.data?.token){
                const token = responce?.data?.data?.token;
                localStorage.setItem("authToken", token);
                return {
                    msg: responce?.data?.data?.message, 
                    status: true
                };
            }
            return {
                msg: responce?.data?.errorMessage?.message, 
                status: false
            };
        } catch (error) {
            return {
                msg: error?.response?.data?.errorMessage?.message || 'Something went wrong', 
                status: false
            };
        }
    }
    return {}
}

export async function registerUser ({name=null, username=null, password=null, email=null}) {
    if(name && username && password && email){
        try{
            const responce = await axios.post(`${BASE_URL}/api/auth/signup`, {
                "name": name,
                "username": username,
                "email": email,
                "password": password
            })

            if(responce?.data?.error==0){
                return {
                    msg: responce?.data?.data?.message, 
                    status: true
                };
            }
            return {
                msg: responce?.data?.errorMessage?.message, 
                status: false
            };
        } catch(error){
            return {
                msg: error?.response?.data?.errorMessage?.message || 'Something went wrong', 
                status: false
            };
        }
    }
    return {}
}

export async function fetchAvailableDoctor (date='2024-12-28') {
    try {
        const responce = await axios.get(`${BASE_URL}/api/doctor/available?date=${date}`);
        if(responce?.data?.error==0){
            return responce?.data?.data?.doctors || [];
        }
    } catch(error){
        return  []
    }
}

export async function fetchDoctorData (id, date) {
    try {
        const responce = await axios.get(`${BASE_URL}/api/doctor/available-slots?id=${id}&date=${date}`)
        if(responce?.data?.error==0){
            return responce?.data?.data?.doctor || {};
        }
    } catch(error) {
        return {}
    }
}

export async function createAppointment ({doctorId, patientName, date, timeSlot}){
    try {
        const authToken = localStorage.getItem("authToken"); // Get the auth token from localStorage
        const responce = await axios.post(`${BASE_URL}/api/appointment/insert`,
            {
                doctorId: doctorId,
                patientName: patientName,
                date: date,
                timeSlot: timeSlot
            },
            {
                headers: {
                  "Authorization": `Bearer ${authToken}` // Set the Authorization header with the token
                }
            }
        )
        return responce?.data?.error == 0;
    } catch(error){
        return false;
    }
}

export async function fetchAppointment ({patientName=''}){
    try {
        const authToken = localStorage.getItem("authToken"); // Get the auth token from localStorage

        const responce = await axios.get(`${BASE_URL}/api/appointment?username=${patientName}`, {
            headers: {
              "Authorization": `Bearer ${authToken}` // Set the Authorization header with the token
            }
        })      

        if(responce?.data?.error == 0 && responce?.data?.data?.length) {
            return responce?.data?.data || []
        }  
        return [];
    } catch(error){
        return [];
    }
}

export async function deleteAppointment ({appointmentID=null}){
    try {
        const authToken = localStorage.getItem("authToken"); // Get the auth token from localStorage
        
        const responce = await axios.delete(`${BASE_URL}/api/appointment/delete/${appointmentID}`,
            {
                headers: {
                  "Authorization": `Bearer ${authToken}` // Include the token in the Authorization header
                }
            })
        
        if(responce?.data?.error == 0 && responce?.data?.data) {
            return {
                status: true,
                msg: responce?.data?.data || 'Appointment deleted successfully'
            }
        }  
        return {
            status: false,
            msg: 'Appointment deleted failed'
        }
    } catch(error){
        return {
            status: false,
            msg: 'Appointment deleted failed'
        }    
    }
}

export async function updateAppointment ({appointmentID=null, date=null, timeSlot=null}){
    try {
        const authToken = localStorage.getItem("authToken"); // Get the auth token from localStorage

        const responce = await axios.patch(`${BASE_URL}/api/appointment/update/${appointmentID}`,
            {
                date, 
                timeSlot
            },
            {
                headers: {
                  "Authorization": `Bearer ${authToken}` // Include the token in the Authorization header
                }
            }
        )
        if(responce?.data?.error == 0 && responce?.data?.data) {
            return {
                status: true,
                msg: responce?.data?.data || 'Appointment update successfully'
            }
        }  
        return {
            status: false,
            msg: 'Appointment update failed'
        }
    } catch(error){
        return {
            status: false,
            msg: 'Appointment update failed'
        }    
    }
}

export async function verifyUserAuth (token=null){
    try {
        if(!token){
            return {
                valid: false,
                message: 'Token is not valid',
                decoded: {}, // Send the decoded payload
            }
        }
        const responce = await axios.post(`${BASE_URL}/api/auth/verifyuser`, {
            token:token
        })

        return responce?.data;
    } catch(error){
        return {
            valid: false,
            message: 'Token is not valid',
            decoded: {}, // Send the decoded payload
        };
    }
}

