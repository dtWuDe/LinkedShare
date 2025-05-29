import React, { use, useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Chat from './pages/Chat/Chat'
import Login from './pages/Login/Login'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer, toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from './context/Appcontext'

const App = () => {
  const { user, login } = useContext(AppContext);
  const navigate = useNavigate();
  const { loadUserData } = useContext(AppContext);

  useEffect(() => {
    if (user) {
      navigate('/chat');
      console.log(user);
      // await loadUserData()
    }
    else {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* <Route path='/' element={<Login/>} /> */}
        <Route path='/' element={<Login onLoginSuccess={login} />} />
        <Route path='/chat' element={<Chat/>} />
      </Routes>
    </>
  )
}

export default App