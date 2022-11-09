import React, { useEffect, useState, useContext } from 'react'
import {auth} from '../firebase'
import { signOut } from "firebase/auth";
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom';
import { CommonContext } from './CommonContext';
import { removeUserCache } from '../services/api';

export const AuthContext = React.createContext()

export const AuthContextProvider = (props) => {

  const [userProfileData, setUserProfileData] = useState({})
  const [cookies, setCookie, removeCookie] = useCookies(['userId'])
  // const [isAdmin, setIsAdmin] = useState(false)
  const { showLoader, hideLoader, showAlert } = useContext(CommonContext)

  const navigate = useNavigate()

  const value = {
    logout,
    userProfileData,
    setUserProfileData,
    userLoggedIn,
    isUserLoggedIn,
    getUserId,
    setUserAsAdmin,
    isUserAdmin
  }

  function userLoggedIn(userId) {
    if (!userId) return
    setCookie('userId', userId, { path: '/'})
  }

  function isUserLoggedIn() {
    if (cookies.userId) return true
    else return false
  }

  function setUserAsAdmin() {
    setCookie('isAdmin', true, { path: '/'})
  }

  function isUserAdmin() {
    if (cookies.isAdmin) return true
    else return false 
  }

  function getUserId() {
    if (isUserLoggedIn())
      return cookies.userId
    else  
      logout()
  }

  function logout() {
    showLoader()
    signOut(auth).then(() => {
      hideLoader()
      removeCookie('userId')
      removeUserCache()
      setUserProfileData(null)
      removeCookie('isAdmin')
      navigate("/auth", {replace:true})
    }).catch((error) => {
      hideLoader()
      showAlert("Failed to logout")
    })
  }

  return(
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  )
}