import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { getAlerts } from '../services/api'
import { Button, Box, Paper, TextField, Grid} from '@mui/material'
import { makeStyles } from "@mui/styles";
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { CommonContext } from '../contexts/CommonContext'
import NotiAlert from '../components/NotiAlert'


const useStyles = makeStyles((theme) => ({
  apptCont : {
    display:'flex',
    padding:'10px',
    margin:'10px',
    flexDirection:'column'
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
  }
}));

function Alerts() {

  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState({})
  const {getUserId} = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)


  useEffect(() => {
    getAlerts().then((response => {
      setAlerts(response)
      setLoading(false)
    }))
    
    //TODO - Optimize this logic by checking the current page
    PushNotifications.addListener('pushNotificationReceived',
      (notification) => {
        showAlert(<NotiAlert props={notification}/>)
        setTimeout(() => {
          setLoading(true)
          getAlerts().then((response => {
            setAlerts(response)
            setLoading(false)
          }))
        }, 1000)
      }
    );
  }, [])

  return (
    <>
    {
      loading ? 
      <ComponentLoader /> :
      <Box>
        <h2 className={classes.center}>Alerts</h2>
        {
          alerts.length ? alerts.map((alert, index) => {
            return <Paper key={index} className={classes.apptCont}>
              <Box>
                <Box className={classes.apptLabel}>Title</Box>
                <Box> {alert.title} </Box>
              </Box>

              <Box>
                <Box className={classes.apptLabel}>Alert</Box>
                <Box> {alert.body} </Box>
              </Box>

              <Box>
                <Box className={classes.apptLabel}>Description</Box>
                <Box> {alert.description} </Box>
              </Box>

              <Box>
                <Box className={classes.apptLabel}>Alert Date & Time</Box>
                <Box> {new Date(alert.timeStamp).toLocaleString() || 'N/A'} </Box>
              </Box>
          
            </Paper>
          }) : 

          <Box sx={{textAlign:'center'}}>
            <h2>No Alerts Found</h2>
          </Box>
        }
      </Box>
    }
    </>
  )
}

export default Alerts
