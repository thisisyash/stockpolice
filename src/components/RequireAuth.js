import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {browserHistory} from 'react-router'
import BottomNavBar from './BottomNavBar'
import { AuthContext } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import whatsapplogo from '../assets/whatsapp.png'


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
  },
  whatsappCont : {
    width:'55px',
    height:'55px',
    position:'absolute',
    right:'2vw',
    bottom:'9vh',
    zIndex:'22'
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
    
    // let resizeObserver
    // setTimeout(() => {
   
    //   const chatBot = document.getElementById('tiledeskdiv')

    //   resizeObserver = new ResizeObserver(() => {
    //     if (chatBot.clientHeight < 200) {
    //       chatBot.setAttribute("style", "bottom:7vh !important; left:0 !important")
    //     } else {
    //       chatBot.setAttribute("style", "bottom:0vh !important; left:0 !important")
    //     }
    //   })
    //   resizeObserver.observe(chatBot);
    //   return () => resizeObserver.disconnect();
    // }, 2000)
  }, [])

  function whatsappMe() {
    window.open(`https://wa.me/918374190096`, '_blank')
  }

  if (isUserLoggedIn()) {
    return <>
      <div>
        <div style={isDesktop ? styles.desktopCont : styles.mobileCont}>
          <div onClick={whatsappMe}>
            <img src={whatsapplogo} style={styles.whatsappCont}/>
          </div>
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
