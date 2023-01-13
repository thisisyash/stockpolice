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
import SmartSlider from "react-smart-slider"
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';


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
    boxShadow:'1px 1px 25px -5px #30bbff',
    marginBottom:'15px'
  },
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  logoCont : {
    marginTop:'10px',
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
  const [slidesArr, setSlidesArr] = useState([])
  const [banners, setBanners] = useState([])
  const [update, setUpdate] = useState(false)

  useEffect(() => {

    getUserData(getUserId(), true).then((response => {
      if (!response) {
        logout()
      }
      if (response.multiLoginError) {
          logout(response)
          return
      }

      setUserData(response)
      setLoading(false)
    }))

    getGlobals().then((resp) => {
      console.log(resp, process.env.REACT_APP_VERSION)

      if (resp.package != process.env.REACT_APP_VERSION) {
        setUpdate(true)
        return
      }

      setVideos(resp.videoLinks)
      setBanners(resp.bannerLinks)
      let slidesArr = []
      if (resp.bannerLinks && resp.bannerLinks.length) {
        resp.bannerLinks.forEach((link) => {
          let obj = {
            url : link,
            childrenElem: <Box onClick={() => openBannerLink(link)} sx={{width:'100%', height:'100%'}} />
          }
          slidesArr.push(obj)
        })
      }
      setSlidesArr(slidesArr)
    }).catch(() => {
      showAlert("Failed to fetch videos", "error")
    })
  }, [])

  const openBannerLink = (link) => {
    let websiteLink = link.split("@@@@@")[1]
    if (websiteLink.slice(0,4) != 'http')
      websiteLink = 'https://'+websiteLink
    window.open(websiteLink, '_blank')
  }
  
  return (
    <>
    <Dialog open={update}>
        <DialogTitle>
          <Box sx={{borderBottom:'1px solid #3c3c3c'}}>
            Alert
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{color:'white'}}>
            A new version of the app is available. Please download it from the website
            <Box sx={{color:'#62bdff', textDecoration:'underline'}}>https://stockpolice.app</Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    {
      loading ? <ComponentLoader /> :
      <Box p={2} sx={{background:'black'}}>
        <div style={styles.logoCont}>
          <img src={stockpolicelogo} style={styles.logoImg}/>
        </div>
        {
          slidesArr && slidesArr.length ? 
          <Box sx={{height:'25vh', marginBottom:'20px'}}>
            <SmartSlider slides={slidesArr} autoSlide={true} height={'25vh'} />
          </Box> : null
        }
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
            videos && videos.length ? 
            <Box>
              {
                videos.map((video, index) => {
                  return(
                  // <Paper style={styles.videoCont} key={index}>
                    <Box style={styles.videoCont} key={index}x>
                    <iframe
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
