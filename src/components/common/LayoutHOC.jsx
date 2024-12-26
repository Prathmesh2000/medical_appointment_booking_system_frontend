import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import { verifyUserAuth } from '../../services/api';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setCommonData } from '../../redux/commonDataSlice';

const LayoutHOC = (Component) => {
  
  return function WrapperComponent(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
      (async ()=>{
        const TOKEN_KEY = 'authToken'; // LocalStorage key for the token
        const token = localStorage.getItem(TOKEN_KEY);
        const responce = await verifyUserAuth(token)

        if(responce?.valid){
          dispatch(setCommonData({ key: "userName", value: responce?.decoded?.username }));
        } else {
          navigate('/');
        }
      })()
    }, []);    

    return (
      <>
        <Navbar />
        <Component {...props} />
      </>
    );
  };
};

export default LayoutHOC;
