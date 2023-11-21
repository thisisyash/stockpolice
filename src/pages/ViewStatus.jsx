import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { editAlertApi, getAlerts, getUserData, getInputTheme, refreshNoti, updateAlertViews, getViewStatus, deleteStatusdoc, updateStatusViews } from '../services/api'
import { Button, Box, Paper, TextField, Grid, Container, Icon, Snackbar} from '@mui/material'
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
import { Carousel } from 'react-responsive-carousel'



const useStyles = makeStyles((theme) => ({
  
  carouselContainer: {
    marginBottom: '20px',
    borderRadius: '5px',
    boxShadow: '0px 0px 5px 2px #30bbff',
  },

  statusImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '5px',
  },
  
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

}))


function ViewStatus() {
  const navigate = useNavigate()
  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const { register : registerEditAlert, handleSubmit : submitAlertEdit, reset : resetEditAlert, formState : {errors:editErrors} } = useForm()
  const [status, setStatus] = useState([])
  const [fromTs, setFromTs] = useState(new Date(new Date().setHours(0,0,0,0)).getTime())
  const {getUserId, logout, isUserAdmin} = useContext(AuthContext)

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
              {
                status.length 
                         ?
                         <Box>
                          {
                            status.map((status, newIndex) => {
                              return <Box key={newIndex} sx={{boxShadow:'0px 0px 5px 2px #30bbff'}} className={classes.apptCont}>
                                   <Box>
                                    {
                                        (status.topic=='desc' &&
                                          (
                                            <Box> 
                                              <div dangerouslySetInnerHTML={{__html:status.body}}/>
                                            </Box>
                                          )
                                        )                                 
                                    }
                                    {
                                      (status.topic=='image' &&
                                        (
                                          <Box sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <img className={classes.prodImg} style={{maxWidth: '-webkit-fill-available'}} src={status.fileLink??''} alt="Product Image" />
                                            
                                          </Box>
                                          
                                        )
                                      )
                                    }
                                    {
                                      (status.topic=='video' &&
                                        (
                                          <video style={{maxWidth: '-webkit-fill-available'}} className={classes.prodVideo} controls>
                                            <source src={status.fileLink??''} type="video/mp4" />
                                            Your browser does not support the video tag.
                                          </video>
                                        )
                                      )
                                    }
                                    
                                    <Box>
                                    <Box className={classes.apptLabel}> 
                                      {new Date(status.timeStamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                    </Box>
                                    {
                                      isUserAdmin() ? 
                                      <Box mt={2}>
                                        <Button variant="contained" sx={{mr:3}} onClick={() => deleteStatus(status)}>
                                          Delete
                                        </Button>
                                        <Button variant="contained" onClick={() => navigate('/statusViews', {state : status})}> 
                                          Read Receipts 
                                        </Button>

                                      </Box> : null
                                    }
                                  
                                  </Box>
                                    
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
