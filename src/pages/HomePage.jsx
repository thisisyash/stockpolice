import React, {useContext, useEffect, useState} from 'react'
import { Button, Box, Card, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getUserData } from '../services/api'
import { AuthContext } from '../contexts/AuthContext'
import ComponentLoader from '../components/ComponentLoader'
import stockpolicelogo from '../assets/stockpolice.png'
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { CommonContext } from '../contexts/CommonContext'


const styles = {
  contentCard : {
    height:130,
    width:150,
    display:'flex',
    flexDirection:'column',
    justifyContent:'space-around',
    padding:10
  },

  infoCard : {
    marginBottom:10,
    display:'flex',
    flexDirection:'column',
    alignItems:'start',
    justifyContent:'space-between',
    padding:20
  },

  countText: {
    fontSize:40,
    textAlign:'center',
    fontWeight:'bold'
  },
  statusText: {
    fontSize:23,
    textAlign:'center',
    fontWeight:'bold'
  },
  logoImg :{
    height: '150px',
    width:'150px'
  },
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  logoCont : {
    marginBottom:2, 
    display:'flex', 
    justifyContent:'center'
  },
  videoCont : {
    padding:'10px', 
    marginBottom:'15px'
  }
}

function HomePage() {

  const navigate = useNavigate()
  const [userData, setUserData] = useState({})
  const {getUserId} = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)


  useEffect(() => {
    getUserData(getUserId()).then((response => {
      setUserData(response)
      setLoading(false)
    }))
  }, [])

  return (
    <>
    {
      loading ? <ComponentLoader /> :
      <Box p={2}>
        <div style={styles.logoCont}>
          <img src={stockpolicelogo} style={styles.logoImg}/>
        </div>
        <Box>
          <Paper style={styles.infoCard}>
            <span>
              Welcome, {userData.userName}
            </span>
            <Box mt={3}>
              <Button variant="outlined" color="primary" onClick={() => navigate('/alerts')}>
                Check Alerts
              </Button>
              <Button variant="outlined" color="primary" sx={{marginLeft:2}} onClick={() => navigate('/profile')}>
                View Profile
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box>
          <h2>Tutorials</h2>
          <Paper style={styles.videoCont}>
            <h3>How to execute Zero Cost Trades?</h3>
            <iframe width="99%"
              src="https://www.youtube.com/embed/yjN4bwZbtxE">
            </iframe>
          </Paper>
          <Paper style={styles.videoCont}>
            <h3>How to execute trades using Robo order ?</h3>
            <iframe width="99%"
              src="https://www.youtube.com/embed/fwAU1NTuSOU">
            </iframe>
          </Paper>
          <Paper style={styles.videoCont}>
            <h3>High Profit with Robo Trade</h3>
            <iframe width="99%"
              src="https://www.youtube.com/embed/eHn5jaBC_Qs">
            </iframe>
          </Paper>
        </Box>
      </Box>
    }
   </>
  )
}

export default HomePage