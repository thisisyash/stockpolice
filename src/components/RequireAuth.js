import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {browserHistory} from 'react-router'
import BottomNavBar from './BottomNavBar'
import { AuthContext } from '../contexts/AuthContext'
import Sidebar from './Sidebar'

const styles = {
  mobileCont : {
    height:'93vh',
    overflowY:'scroll'
  },
  desktopCont : {
    // width : '50vw',
    overflowY:'scroll',
    marginLeft:'15vw',
    fontSize:'25px',
    height:'99vh'
  }
}

function RequireAuth({props}) {

  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia("(min-width: 768px)").matches
  )

  const {isUserLoggedIn, isUserAdmin} = useContext(AuthContext)

  useEffect(() => {
    window
    .matchMedia("(min-width: 768px)")
    .addEventListener('change', e => setIsDesktop( e.matches ))
    
    
    let resizeObserver
    setTimeout(() => {
   
      const chatBot = document.getElementById('tiledeskdiv')

      resizeObserver = new ResizeObserver(() => {
        if (chatBot.clientHeight < 200) {
          chatBot.setAttribute("style", "bottom:6vh !important;")
        } else {
          chatBot.setAttribute("style", "bottom:0vh !important;")
        }
      })
      resizeObserver.observe(chatBot);
      return () => resizeObserver.disconnect();
    }, 2000)
  }, []);

  if (isUserLoggedIn()) {
    return <>
      <div>
        <div style={isDesktop ? styles.desktopCont : styles.mobileCont}>
          <Outlet />
        </div>
        <div>
          {
            isDesktop ? <Sidebar /> : <BottomNavBar />
          }
        </div> 
      </div>
    </> 
  } 
  return  <Navigate to="/auth" replace="true"/>
}

export default RequireAuth
