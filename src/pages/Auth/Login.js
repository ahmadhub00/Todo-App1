import { Button, Divider, Form, Input, message } from 'antd'
import Title from 'antd/es/typography/Title'
import React, {  useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { auth } from '../../config/firebase'
import {  signInWithEmailAndPassword } from 'firebase/auth'
import { useAuthContext } from '../../contexts/AuthContext'

export default function Login() {
  const{readUser,isAuth}=useAuthContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [state, setState] = useState({ fullName: "", email: "", password: "", dob: "" })
  const handleChange = (e) => setState({ ...state, [e.target.name]: e.target.value })
  const handleLogin = (e) => {
    e.preventDefault()
    let{email,password}=state
setIsProcessing(true)
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => { 
    const user = userCredential.user;
    readUser(user);
    message.success("Login sucessfull");
    
  })
  .catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  message.error("Login Not sucessfull,Some error")
})
  .finally(()=>{
    setIsProcessing(false)
  });
  }
  
  return (
    <>
      <main className='auth'>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="card p-3 p-md-4">
                <Title level={2} className='m-0 text-center'>Login</Title>

                <Divider />

                <Form layout="vertical">
                  <Form.Item label="Email">
                    <Input placeholder='Input your email' name='email' onChange={handleChange} />
                  </Form.Item>
                  <Form.Item label="Password">
                    <Input.Password placeholder='Input your password' name='password' onChange={handleChange} />
                  </Form.Item>

{/* <Navigate to="/dashboard" />; */}
                
                  <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleLogin}><Link to={"/dashboard"}>Login</Link></Button>
                  <Form.Item label="New Here ?" >
                    <Link to={"/auth/signup"} >
                      <h3>Sign Up !</h3>
                    </Link>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
