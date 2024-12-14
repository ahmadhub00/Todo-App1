import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { auth, firestore } from '../config/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
const AuthContext = createContext()
const initState = { isAuth: false, user: {} }
const reducer = (state, { type, payload }) => {
    switch (type) {
        case "SET_LOGGED_IN":
            return { isAuth: true, user: payload.user }
        case "SET_LOGGED_OUT":
            return initState
        default:
            return state
    }
}
export default function AuthContextProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initState)
    const [isAppLoading, setIsAppLoading] = useState(true)
    const readUser=async(user)=>{
        const docRef = doc(firestore, "users", user.uid);
        // console.log('user.uid', user.uid)
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
        //   console.log("Document data:", );
        const user=docSnap.data()
          dispatch({ type: "SET_LOGGED_IN", payload: { user } })
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }
        setIsAppLoading(false)
    }
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
                readUser(user)
              } else {
                setIsAppLoading(false)
            }
            })
          }, [])
    return (
        <>
            <AuthContext.Provider value={{setIsAppLoading,isAppLoading, ...state, dispatch,readUser }}>
                {children}
            </AuthContext.Provider>
        </>
    )
}
export const useAuthContext = () => useContext(AuthContext) 