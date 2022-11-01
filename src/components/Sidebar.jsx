import React from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import stockpolice from '../assets/stockpolice.png'

const styles = {
  sidebarCont : {
    position : 'absolute',
    left:0,
    top:0,
    width:'14vw',
    height:'100vh',
    boxShadow:'3px 0px 10px 0px #d9d9d9'
  },
  logoImg : {
    width:'12vw',
    height:'125px',
    marginLeft:'1vw'
  }
}

function Sidebar() {

  const navigate = useNavigate()

  const boxSX = {
    padding:'10px',
    cursor:'pointer',
    margin:'10px',
    borderBottom : '1px solid #cbcbff',
    "&:hover": {
      backgroundColor: '#cbcbff'
    },
  };

  return (
    <Box style={styles.sidebarCont}>
      <img src={stockpolice} style={styles.logoImg} />
      <Box sx={boxSX} onClick={() => navigate("/")}>
          Home
       </Box>
       <Box sx={boxSX} onClick={() => navigate("/alerts")}>
          Alerts
       </Box>
       <Box sx={boxSX} onClick={() => navigate("/uploadContacts")}>
          Upload Contacts
       </Box>
       <Box sx={boxSX} onClick={() => navigate("/sendNotification")}>
          Send Notification
       </Box>
       <Box sx={boxSX} onClick={() => navigate("/manageUsers")}>
          Manage Users
       </Box>
       <Box sx={boxSX} onClick={() => navigate("/profile")}>
          Profile
       </Box>
    </Box>
  )
}

export default Sidebar
