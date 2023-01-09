import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { editAlertApi, getAlerts, getUserData, getInputTheme, refreshNoti } from '../services/api'
import { Button, Box, Paper, TextField, Grid} from '@mui/material'
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

function Alerts() {

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

  // const [groups, setGroups] = useState({})

  useEffect(() => {
    
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
        }, 1500)
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
    <Modal
      open={editModal}
      onClose={onEditAlertClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box className={classes.modalStyle}>
        <Box className={classes.appointmentBox}>
        <h4>Edit Alert</h4>

          <form onSubmit={submitAlertEdit(editAlert)}>
            <Box mb={3}>
              <TextField
                placeholder="Alert Data"
                label="Alert Data"
                variant="outlined"
                fullWidth
                multiline
                autoFocus
                className={classes.inputBox}
                rows={4}
                autoComplete='off'
                defaultValue={selectedAlert?.body}
                name="alertData"
                {...registerEditAlert("alertData", {
                  required: "Required field"
                })}
                error={Boolean(editErrors?.alertData)}
                helperText={editErrors?.alertData?.message}
              />
            </Box>
            
            <Box>
              <Button variant="outlined" sx={{marginRight:2}}
                onClick={onEditAlertClose}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>
            
          </form>
        </Box>
      </Box>
    </Modal>

    {
      loading ? 
      <ComponentLoader /> :
      <Box sx={{background:'black'}}>
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
                      return <Box key={newIndex} sx={{boxShadow:'0px 0px 5px 2px #30bbff'}} className={classes.apptCont}>
                      <Box>
                        <Box sx={{fontSize:25}}> {alert.body} </Box>
                      </Box>
        
                      <Box>
                        <Box className={classes.apptLabel}> 
                          {new Date(alert.timeStamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                        </Box>
                        {
                          isUserAdmin() ? 
                          <Box mt={2}>
                            <Button variant="contained" onClick={() => selectAlertToEdit(alert)}>
                              Edit
                            </Button>
                          </Box> : null
                        }
                        
                      </Box>
                  
                    </Box>
        
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
