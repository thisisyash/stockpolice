import React, { useEffect, useState, useContext } from 'react'
import {auth} from '../firebase'
import { signOut } from "firebase/auth";
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom';
import { CommonContext } from './CommonContext';
import { removeUserCache, unRegisterToken } from '../services/api';

export const AuthContext = React.createContext()

export const AuthContextProvider = (props) => {

  const [userProfileData, setUserProfileData] = useState({})
  const [cookies, setCookie, removeCookie] = useCookies(['userId','userName', 'isAdmin', 'deviceToken'])
  // const [isAdmin, setIsAdmin] = useState(false)
  const { showLoader, hideLoader, showAlert } = useContext(CommonContext)

  const navigate = useNavigate()

  const value = {
    logout,
    userProfileData,
    setUserProfileData,
    userLoggedIn,
    isUserLoggedIn,
    userNameLoggedIn,
    isUserNameLoggedIn,
    getUserId,
    getUserName,
    setUserAsAdmin,
    isUserAdmin,
    setDeviceTokenCookie,
    getDeviceTokenCookie
  }

  function setDeviceTokenCookie(token) {
    setCookie('deviceToken', token.replace(/[^a-zA-Z0-9]/g, ""), { path: '/'})
  }

  function getDeviceTokenCookie() {
    if (cookies.deviceToken) return cookies.deviceToken
    else return null
  }

  function userLoggedIn(userId) {
    if (!userId) return
    setCookie('userId', userId, { path: '/'})
  }

  function isUserLoggedIn() {
    if (cookies.userId) return true
    else return false
  }


  function userNameLoggedIn(userName) {
    if (!userName) return
    setCookie('userName', userName, { path: '/'})
  }

  function isUserNameLoggedIn() {
    if (cookies.userName) return true
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


  function getUserName() {
    if (isUserNameLoggedIn())
      return cookies.userName
    else  
      logout()
  }

  function logout(data) {
    if (data) {
      if (data.multiLoginError) {
        showAlert("Account logged in from multiple devices. Please login again.")
      }
    }
    showLoader()
    signOut(auth).then(() => {
      
      removeUserCache()
      setUserProfileData(null)

      removeCookie('userId')
      removeCookie('isAdmin')
      removeCookie('deviceToken')
      removeCookie('userName')
      if (data.deviceToken) {
        unRegisterToken(data.deviceToken, data.groups).then(async()=> {
          // console.log("Removing device from notifications : ", data.deviceToken, data.groups)
          hideLoader()
          navigate("/auth", {replace:true})
        }).catch(async(error) => {
          showAlert("Some unexpected error occured")
        })
      } else {
        hideLoader()
        navigate("/auth", {replace:true})
      }
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