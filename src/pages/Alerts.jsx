import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { getAlerts, getUserData } from '../services/api'
import { Button, Box, Paper, TextField, Grid} from '@mui/material'
import { makeStyles } from "@mui/styles";
import { getGroups } from '../services/api'
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { CommonContext } from '../contexts/CommonContext'
import NotiAlert from '../components/NotiAlert'
import { Capacitor } from '@capacitor/core'


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
  const [alerts, setAlerts] = useState([])
  const {getUserId, logout} = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [fromTs, setFromTs] = useState(new Date(new Date().setHours(0,0,0,0)).getTime())
  const [pushNotiRegistered, setPushNotiRegistered] = useState(false)


  // const [groups, setGroups] = useState({})

  useEffect(() => {
    
    getDateWiseAlerts(fromTs)
  }, [])

  const addPushNotiListener = (userGroups) => {
    //TODO - Optimize this logic by checking the current page
    PushNotifications.addListener('pushNotificationReceived',
      (notification) => {
        setPushNotiRegistered(true)
        showAlert(<NotiAlert props={notification}/>)
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
        }, 1000)
      }
    )
  }

  const getDateWiseAlerts = (fromTs) => {
    getUserData(getUserId(), true).then((resp) => {
      if (resp.multiLoginError) {
        logout(resp)
        return
      }
      if (!pushNotiRegistered) addPushNotiListener(resp.groups)
      getAlerts(fromTs, new Date(new Date(fromTs).getTime() + 60 * 60 * 24 * 1000).getTime(), resp.groups).then((response => {
        let prevAlerts = Array.from(alerts)
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
    getDateWiseAlerts(new Date(new Date(fromTs).getTime() - 60 * 60 * 24 * 1000).getTime())
  }

  return (
    <>
    {
      loading ? 
      <ComponentLoader /> :
      <Box>
        <h2 className={classes.center}>Alerts</h2>
        {
          alerts.map((alert, index) => {
            return (
            <Box key={index}>
            <Box sx={{paddingLeft:'10px'}}>
              {new Date(alert.timeStamp).toDateString() || 'N/A'}
            </Box>
              {
                alert.alertItems.length ? <Box> 
                  
                  {
                    alert.alertItems.map((alert, newIndex) => {
                      return <Paper key={newIndex} className={classes.apptCont}>
                      <Box>
                        <Box sx={{fontSize:20}}> {alert.body} </Box>
                      </Box>
        
                      <Box>
                        <Box className={classes.apptLabel}> 
                          {new Date(alert.timeStamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                        </Box>
                      </Box>
                  
                    </Paper>
        
                    })
                  }
                </Box> : 
                <Box className={classes.center} p={4}>
                  No Alerts Found
                </Box>
              }
            </Box>)
          }) 
        }
        <Box className={classes.center} sx={{paddingBottom:3}}>
          <Button variant="contained" onClick={loadMoreAlerts}> Load previous alerts </Button>
        </Box>

      </Box>
    }
    </>
  )
}

export default Alerts
