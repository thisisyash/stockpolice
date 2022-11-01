import React, { useState, useContext } from 'react'
import { BottomNavigation, BottomNavigationAction } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ShareIcon from '@mui/icons-material/Share';
import { useNavigate } from 'react-router-dom'
import StyleIcon from '@mui/icons-material/Style';
import { AuthContext } from '../contexts/AuthContext'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function BottomNavBar() {
  const [activeIndex, setActiveIndex] = useState(0)
  const {getUserId} = useContext(AuthContext)

  const navigate    = useNavigate()
  return (
    <BottomNavigation sx={{width:'100%', position:'absolute', bottom:0, height:'7vh', boxShadow:'0px -3px 10px -5px #666666;'}}
      value={activeIndex}
      onChange={(event, newIndex) => {
        setActiveIndex(newIndex)
        switch (newIndex) {
          case 0:
            navigate("/")
            break;
          case 1:
            navigate("/alerts")
            break;
          case 2:
            navigate("/profile")
            break;
          case 3:
            navigate("/adminPanel")
            break;
          default:
            break;
        }
      }}
      showLabels>
      <BottomNavigationAction label="Home" icon={<HomeIcon />}/> 
      <BottomNavigationAction label="Alerts" icon={<NotificationsActiveIcon />}/> 
      <BottomNavigationAction label="Profile" icon={<PersonIcon />}/>
      {/* <BottomNavigationAction label="Admin" icon={<AdminPanelSettingsIcon />}/> */}
    </BottomNavigation>
  )
}

export default BottomNavBar
