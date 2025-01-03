import { Button, DatePicker, Divider, Form, Input, message } from 'antd'
import React, { useState } from 'react'
import { auth, firestore } from '../../config/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Link } from 'react-router-dom'
import Title from 'antd/es/typography/Title'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useAuthContext } from '../../contexts/AuthContext'

export default function Signup() {
  const { dispatch } = useAuthContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [state, setState] = useState({ fullName: "", email: "", password: "", dob: "" })
  const handleChange = (e) => setState({ ...state, [e.target.name]: e.target.value })
  const handleSignUp = (e) => {
    e.preventDefault()
    setIsProcessing(true)
    let { email, password, fullName, dob } = state
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        createUser(user)
        // message.success(" Signup sucessFully")
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        message.error("Some Problem Ocuurs in Signup")
      })
      .finally(() => {
        setIsProcessing(false)
      })
      ;
  }
  const createUser = async (user) => {
    let { email, uid } = user
    let { fullName, dob } = state
    let userData = {
      email, uid, fullName, dob,
      dateCreated: serverTimestamp(), status: "active",
    }
    try {
      await setDoc(doc(firestore, "users", uid), userData);
      message.success("A new user has been created successfully")
      dispatch({ type: "SET_LOGGED_IN", payload: { user: userData } })
    } catch (e) {
      message.error("Something went wrong while creating user profile")
      console.error("Error adding document: ", e);
    }}
    return (
        <>
          <main className='auth'>
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="card p-3 p-md-4">
                    <Title level={2} className='m-0 text-center'>Register</Title>
    
                    <Divider />
    
                    <Form layout="vertical">
                      <Form.Item label="Full Name">
                        <Input placeholder='Input your full name' name='fullName' onChange={handleChange} />
                      </Form.Item>
                      <Form.Item label="Email">
                        <Input placeholder='Input your email' name='email' onChange={handleChange} />
                      </Form.Item>
                      <Form.Item label="Password">
                        <Input.Password placeholder='Input your password' name='password' onChange={handleChange} />
                      </Form.Item>
                      <Form.Item label="Birth Date">
                        <DatePicker className='w-100' onChange={(dateObject, dateString) => { setState(s => ({ ...s, dob: dateString })) }} />
                      </Form.Item>
    
                      <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleSignUp}>Register</Button>
                      <Form.Item label="Alraedy has Account?" >
                        <Link to={"/auth/login"} >
                          <h3>Log in !</h3>
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
    