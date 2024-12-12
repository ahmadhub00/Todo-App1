import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from "./Auth/Login"
import { useAuthContext } from '../contexts/AuthContext'
import PrivateRoutes from './PrivateRoutes'
import Dashboard from "./Dashboard"
import Signup from './Auth/Signup'
export default function Index() {
    const { isAuth } = useAuthContext()
    return (
        <>
            <Routes>
                <Route path='/' element={<PrivateRoutes Component={Dashboard} />} />
                <Route path='/auth/login' element={!isAuth ? <Login /> : <Navigate to="/" />} />
                <Route path='/auth/signup' element={!isAuth ? <Signup /> : <Navigate to="/" />} />
                <Route path='/dashboard' element={<PrivateRoutes Component={Dashboard} />} />
            </Routes>
        </>
    )
}
