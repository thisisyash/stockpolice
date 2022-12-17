import React, {useContext, useEffect, useState} from 'react'
import { Button, Box, Card, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getGlobals, getUserData } from '../services/api'
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
    width:'150px',
    boxShadow:'1px 1px 25px -5px #00e6ff',
    marginBottom:'15px'
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
    padding:'5px', 
    marginBottom:'5px'
  }
}

function HomePage() {

  const navigate = useNavigate()
  const [userData, setUserData] = useState({})
  const {getUserId, getDeviceTokenCookie, logout} = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [videos, setVideos] = useState([])

  useEffect(() => {

    getUserData(getUserId(), true).then((response => {
      if (response.multiLoginError) {
          logout(response)
          return
      }
      setUserData(response)
      setLoading(false)
    }))

    getGlobals().then((resp) => {
      setVideos(resp.videoLinks)
    }).catch(() => {
      showAlert("Failed to fetch videos", "error")
    })
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
          {
            videos.length ? 
            <Box>
              {
                videos.map((video, index) => {
                  return(
                  // <Paper style={styles.videoCont} key={index}>
                    <Box style={styles.videoCont} key={index}x>
                    <iframe width="99%"
                      src={video}>
                    </iframe>
                    </Box>
                  // </Paper>
                  )
                })
              }
            </Box>
            :
            <Box sx={{margin:'10px 0'}}>
              <h2>
                No videos found
              </h2>
            </Box>
          }
        </Box>
      </Box>
    }
   </>
  )
}

export default HomePage
