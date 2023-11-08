import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { editAlertApi, getAlerts, getUserData, getInputTheme, refreshNoti, updateAlertViews, getViewStatus } from '../services/api'
import { Button, Box, Paper, TextField, Grid, Container, Icon} from '@mui/material'
import { makeStyles } from "@mui/styles";
import { getGroups } from '../services/api'
import { useForm } from "react-hook-form";
import Modal from '@mui/material/Modal';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { CommonContext } from '../contexts/CommonContext'
import NotiAlert from '../components/NotiAlert'
import { Capacitor } from '@capacitor/core'
import {NativeAudio} from '@capacitor-community/native-audio'
import { Navigate, useNavigate } from 'react-router-dom'
import { NavigateBeforeRounded } from '@mui/icons-material'



const useStyles = makeStyles((theme) => ({
  apptCont : {
    display:'flex',
    padding:'10px',
    margin:'20px 15px',
    flexDirection:'column',
    background:'white',
    color:'black',
    borderRadius:'5px'
  },

  apptLabel: {
    fontSize:'13px',
    marginTop:'10px',
    fontWeight:'280'
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

}));





function ViewStatus() {
  const navigate = useNavigate()
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const { register : registerEditAlert, handleSubmit : submitAlertEdit, reset : resetEditAlert, formState : {errors:editErrors} } = useForm()
  const [status, setStatus] = useState([])
  const [fromTs, setFromTs] = useState(new Date(new Date().setHours(0,0,0,0)).getTime())

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
    getViewStatus(fromTs, new Date(new Date(fromTs).getTime() + 60 * 60 * 24 * 1000).getTime()).then((response => {
      
      setStatus(response)
      setLoading(false)     
    }))
  }
  

  return (
    <>
    {
      loading ? 
      <ComponentLoader />:
      <Box sx={{background:'black'}}>
        <h2 className={classes.center}>Status</h2>
        
        
         
          
            
              <Box sx={{paddingLeft:'10px'}}>
                {new Date(fromTs).toDateString() || 'N/A'}
              </Box>
              {
                status.length 
                         ?
                         <Box>
                          {
                            status.map((status, newIndex) => {
                              return <Box key={newIndex} sx={{boxShadow:'0px 0px 5px 2px #30bbff'}} className={classes.apptCont}>
                                   <Box>
                                    {
                                        status.topic=='desc' 
                                        
                                        ?

                                        <Box> 
                                          <div dangerouslySetInnerHTML={{__html:status.body}}/>
                                        </Box>
                                        :
                                        <Box sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <img className={classes.prodImg} style={{maxWidth: '-webkit-fill-available'}} src={status.fileLink??''} alt="Product Image" />
                                        </Box>
                                    }
                                    
                                  </Box>
                                  
                              </Box>
                               
                            })
                          }
                         </Box>
                           :
                          <Box className={classes.center} p={4} >
                            No Status Found
                          </Box>
              }
            
        
        
      </Box>
    }
    </>
  )

  

  

  
}

export default ViewStatus
