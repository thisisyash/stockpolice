import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { editAlertApi, getAlerts, getUserData, getInputTheme, refreshNoti, updateAlertViews, getViewStatus, deleteStatusdoc, updateStatusViews } from '../services/api'
import { Button, Box, Paper, TextField, Grid, Container, Icon, Snackbar, keyframes} from '@mui/material'
import { makeStyles } from "@mui/styles"
import { getGroups } from '../services/api'
import { useForm } from "react-hook-form"
import Modal from '@mui/material/Modal'

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications'
import { CommonContext } from '../contexts/CommonContext'
import NotiAlert from '../components/NotiAlert'
import { Capacitor } from '@capacitor/core'
import {NativeAudio} from '@capacitor-community/native-audio'
import { Navigate, useNavigate } from 'react-router-dom'
import { NavigateBeforeRounded } from '@mui/icons-material'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import styled from '@emotion/styled'


const ContainerBox = styled(Box)(()=>({
  position : 'relative'
}))

const NavBar = styled(Box)(()=>({
  display : 'flex',
  justifyContent : 'space-between',
  gap : '5px',
  margin : '10px',
}))

const useStyles = makeStyles((theme) => ({
  
  
  apptCont : {
    display:'flex',
    flexDirection :'row',
    justifyContent : 'center',
    borderRadius:'5px',
    width : '100%',
    maxWidth : '500px',
    
  },
  prodImg : {
    width : '100%',
    height : '70vh'
  },

  apptLabel: {
    fontSize:'18px',
    marginBottom:'10px',
    fontWeight:'280',
    textAlign : 'center'
  },
  eachStatus :{
    position :'absolute',
     top : '50%' ,
     left : '50%' ,
      transform : 'translate(-50% , -50%)'
  },

  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },

  modalStyle : {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display:'flex',
    justifyContent:'center'
  },

  appointmentBox : {
    background : 'black',
    padding:'20px',
    borderRadius:'5px',
    width:'80vw',
    color:'white',
    maxWidth:'700px'
  },

  ...getInputTheme()
}))



const moveAnimation =keyframes`
  0%  {
    border-color : white
    transform: scaleX(0)
  }
  100% {
    border-color : white
    transform: scaleX(1)
}
`


function ViewStatus() {
  const navigate = useNavigate()
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const { register : registerEditAlert, handleSubmit : submitAlertEdit, reset : resetEditAlert, formState : {errors:editErrors} } = useForm()
  const [status, setStatus] = useState([])
  const [fromTs, setFromTs] = useState(new Date(new Date().setHours(0,0,0,0)).getTime())
  const {getUserId, logout, isUserAdmin} = useContext(AuthContext)
  const [currentStatusIndex , setCurrentStatusIndex] = useState(0)
  
  
  const NavStatusBar = styled(Box)(({statusIndex , animate })=>({
    position : 'relative',
    border : '2px solid gray',
    width : '100%',
    '&::before' : {
      content : '""',
      position : 'absolute',
      top : '0',
      left : '0',
      width : '100%',
      height : '100%',
      transformOrigin : 'left',
      borderColor :animate ? 'white' : 'gray',
      borderWidth : '2px',
      borderStyle : 'solid',
      animation : statusIndex === currentStatusIndex ?  `${moveAnimation} 1s linear forwards ` : 'none',
      margin : '-2px',
      
    }
  }))

  const handleStatusChange = (index)=>{
    setCurrentStatusIndex(index)
  }

  useEffect(() => {

    NativeAudio.preload({
      assetId: "mysound",
      assetPath: "mysound.mp3",
      audioChannelNum: 1,
      isUrl: false
    })
    getTodayStatus(fromTs)
  }, [])

 
  const getTodayStatus = (fromTs) => {
    setFromTs(new Date(new Date().setHours(0,0,0,0)).getTime())
    getUserData(getUserId(), true).then((resp) => {
      if (resp.multiLoginError) {
        logout(resp)
        return
      }
      getViewStatus(fromTs, new Date(new Date(fromTs).getTime() + 60 * 60 * 24 * 1000).getTime()).then((response => {
        // console.log(response)
        setStatus(response)
  
        const userData = {
          name       : resp.userName,
          viewedOn   : new Date().toLocaleString(),
          clientCode : resp.clientCode,
          mobileNo   : resp.mobileNo
        }
  
        response.forEach((status) => {

          if (status.statusViews) {

            if (status.statusViews.some((statusView) => statusView.clientCode == resp.clientCode)) {
              //Status view already recorded. Nothing to do
            } else {
              const params = {
                uid        : status.uid,
                statusViews : status.statusViews.concat(userData)
              }
              // //If user has not viewed then call this api
              updateStatusViews(params).then((response) => {
                //Status views updated successfully
              }).catch((err) => {
                //Error in updating status views
              })
            }           
          } else {

            const params = {
              uid        : status.uid,
              statusViews : [userData]
            }
              updateStatusViews(params).then((response) => {
                //Status views updated successfully
              }).catch((err) => {
                //Error in updating alert views
              })
          }

        })

        setLoading(false)     
      }))
    })
  }

  async function deleteStatus(status){

    showLoader()
    deleteStatusdoc(status.uid).then((response) => {
      showSnackbar('Status Deleted Successfully', 'success')
      hideLoader()
      getTodayStatus(fromTs)
    }).catch((err) => {
      //Error in updating alert views
      showAlert('Failed to delete status')
      hideLoader()
    })
  }

  const formatStatusTime = (timestamp) => {

    const today     = new Date(),
          yesterday = new Date(today)

    yesterday.setDate(today.getDate() - 1)
  
    if (timestamp.getDate() == today.getDate()) {
      return 'Today ' + formatAMPM(timestamp)
    } else if (timestamp.getDate() == yesterday.getDate()) {
      return 'Yesterday ' + formatAMPM(timestamp)
    } else {
      // Display the full date and time for other days
      return timestamp.toLocaleString('en-US', {
        hour    : 'numeric',
        minute  : 'numeric',
        hour12  : true,
        weekday : 'short',
        month   : 'short',
        day     : 'numeric',
      })
    }
  }
  
  
  const formatAMPM = (date) => {

    let hours   = date.getHours(),
        minutes = date.getMinutes()

    return ((hours % 12) || hours) + ':' 
            + (minutes < 10 ? '0' + minutes : minutes) + ' ' 
            + hours >= 12 ? 'PM' : 'AM'
  }

  return (
    <>
    {
      loading ? 
      <ComponentLoader /> :
      <Box sx={{background:'black'}}>
        <h2 className={classes.center}>Status Updates</h2>
              <Box sx={{paddingLeft:'10px'}}>
                {new Date(fromTs).toDateString() || 'N/A'}
              </Box>
            <ContainerBox>
              <NavBar>
                { status && 
                  [...Array(status.length)].map((statusBar , index)=>(
                    
                    <NavStatusBar
                     key={index} 
                     statusIndex={index} 
                     animate={statusBar &&
                     (statusBar.topic === 'image' || statusBar.topic === 'desc' || statusBar.topic === 'video')}
                     >
                  
                    </NavStatusBar>
                  ))
                  
                }
              </NavBar>
              <br/>


              {
                status.length ? 

                <Carousel
                    showArrows={true}
                    showThumbs={false}
                    autoPlay={true}
                    interval={2000}
                    showStatus={false}
                    showIndicators={false}
                    onChange={handleStatusChange}
                    
                  >
                  {status.map((status, newindex) => {
                  return <Box key={newindex} sx={classes.apptCont}>
                  <Box className={classes.apptLabel}>
                        {formatStatusTime(new Date(status.timeStamp))}
                  </Box>
                 
                  <Box sx={classes.eachStatus}>
                    {status.topic === 'desc' && (
                      <div dangerouslySetInnerHTML={{ __html: status.body }} style={{position :'absolute', top : '50%' ,left : '50%' , transform : 'translate(-50% , -50%)' }}/>
                    )}
                  </Box>

                  <Box sx={classes.eachStatus}>
                    {status.topic === 'image' && (
                      <img
                        className={classes.prodImg}
                        style={{ maxWidth: '-webkit-fill-available' }}
                        src={status.fileLink ?? ''}
                        alt="Product Image"
                      />
                    )}
                  </Box>

                  <Box sx={classes.eachStatus}>
                    {status.topic === 'video' && (
                      <video
                        style={{ maxWidth: '-webkit-fill-available' }}
                        className={classes.prodVideo}
                        controls
                      >
                        <source src={status.fileLink ?? ''} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </Box>
                  </Box>
                  }
                  )}

               
                </Carousel>
              
               : 
                <Box className={classes.center} p={4}>
                  No Status Found
                </Box>
              
            }
               

            </ContainerBox>
             
        
      </Box>
    }
    </>
  )

  

  

  
}

export default ViewStatus
