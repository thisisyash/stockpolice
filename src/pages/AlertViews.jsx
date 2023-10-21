import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { editAlertApi, getAlerts, getUserData, getInputTheme, refreshNoti } from '../services/api'
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
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';


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
  contentCard : {
    height:130,
    width:'100%',
    display:'flex',
    flexDirection:'column',
    justifyContent:'space-around',
    padding:10,
    alignItems:'center'
  },
  ...getInputTheme()
}));

function AlertViews() {

  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const {getUserId, logout, isUserAdmin} = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [fromTs, setFromTs] = useState(new Date(new Date().setHours(0,0,0,0)).getTime())
  const [pushNotiRegistered, setPushNotiRegistered] = useState(false)
  const [editModal, setEditModal] = React.useState(false)
  const { register : registerEditAlert, handleSubmit : submitAlertEdit, reset : resetEditAlert, formState : {errors:editErrors} } = useForm()
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [eaxampleAlert, setexampleAlert] = useState('<p style="background-color:rgba(255,255,102);color:black;">example alert</p>')

  // const [groups, setGroups] = useState({})

  useEffect(() => {

    NativeAudio.preload({
      assetId: "mysound",
      assetPath: "mysound.mp3",
      audioChannelNum: 1,
      isUrl: false
    })
  
    getDateWiseAlerts(fromTs, true)
  }, [])

  const editAlert = (data) => {
    const alertData = {
      uid : selectedAlert.uid,
      newBody : data.alertData
    }
    showLoader()
    
    editAlertApi(alertData).then(() => {
      refreshNoti({topic : selectedAlert.topic}).then(() => {
        showSnackbar("Alert edited successfully")
        onEditAlertClose()
        hideLoader()
        setLoading(true)
        getDateWiseAlerts(new Date(new Date().setHours(0,0,0,0)).getTime(), true)
      }).catch(() => {
        showAlert("Failed to update alert")
        hideLoader()
      })
    }).catch(() => {
      showAlert("Failed to update alert")
      // onEditAlertClose()
      hideLoader()
    })
  }

  const onEditAlertClose = () => {    
    setSelectedAlert(null)
    setEditModal(false)
    resetEditAlert()
  }

  const selectAlertToEdit = (alert) => {
    setSelectedAlert(alert)
    setEditModal(true)
  }

  const addPushNotiListener = (userGroups) => {

    //TODO - Optimize this logic by checking the current page
    PushNotifications.addListener('pushNotificationReceived',
      (notification) => {
        setPushNotiRegistered(true)

        // Do not show alert during refresh on edit
        if (notification.data && notification.data.key && notification.data.key == 'REFRESH_NOTIFICATION') {

        } else {
          NativeAudio.play({assetId: 'mysound'})
          showAlert(<NotiAlert props={notification}/>)
        }
        
        setTimeout(() => {
          //Referesh the alerts data after receiving the notification
          setLoading(true)
          setFromTs(new Date(new Date().setHours(0,0,0,0)).getTime())
          getAlerts(fromTs, new Date(new Date(fromTs).getTime() + 60 * 60 * 24 * 1000).getTime(), userGroups).then((response => {
            setAlerts([{
              timeStamp : fromTs,
              alertItems : response
            }])
            setLoading(false)           
          }))
        }, 2500)
      }
    )
  }

  const getDateWiseAlerts = (fromTs, reset) => {
    getUserData(getUserId(), true).then((resp) => {
      if (resp.multiLoginError) {
        logout(resp)
        return
      }
      if (!pushNotiRegistered) addPushNotiListener(resp.groups)
      getAlerts(fromTs, new Date(new Date(fromTs).getTime() + 60 * 60 * 24 * 1000).getTime(), resp.groups).then((response => {
        let prevAlerts = reset ? []  : Array.from(alerts)
        prevAlerts.push(
          {
            timeStamp : fromTs,
            alertItems : response
          }
        )
        setAlerts(prevAlerts)
        hideLoader()
        setLoading(false)
      }))
    })
  }

  const loadMoreAlerts = () => {
    showLoader()
    setFromTs(new Date(new Date(fromTs).getTime() - 60 * 60 * 24 * 1000).getTime())
    getDateWiseAlerts(new Date(new Date(fromTs).getTime() - 60 * 60 * 24 * 1000).getTime(), false)
  }

  return (
    <>
    

    {
      
      
      <Box sx={{background:'black'}}>
        <h2 className={classes.center}>Viewed Status</h2>
        <Grid>
        <Grid>
            <Paper style={useStyles.contentCard}>
              <ViewCarouselIcon fontSize='large'/>
              <span>
                {getUserId()} 
              </span>
            </Paper>
          </Grid>
        </Grid> 
      </Box>
      
      
    }
    
    </>
  )
}

export default AlertViews
