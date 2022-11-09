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

  const {isUserLoggedIn} = useContext(AuthContext)

  useEffect(() => {
    window
    .matchMedia("(min-width: 768px)")
    .addEventListener('change', e => setIsDesktop( e.matches ));
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
