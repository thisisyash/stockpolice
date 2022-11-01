import React,  {useContext, useEffect, useState} from 'react'
import { TextField, Button, Box, Card, Paper, Grid } from '@mui/material'
import { makeStyles } from "@mui/styles";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from '../contexts/AuthContext';
import { CommonContext } from '../contexts/CommonContext';
import { sendNewNotification } from '../services/api';

const useStyles = makeStyles((theme) => ({
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  // whiteBg : {
  //   background:'white !important',
  //   height:'-webkit-fill-available'
  // },
  prodImg: {
    height:'30vw',
    width:'30vw'
  }
}))



function SendNotification() {

  const classes = useStyles()
  const { register, handleSubmit, control, reset, formState : {errors} } = useForm()
  const [userData, setUserData] = useState({})
  const {getUserId} = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)


  function onFormSubmit(data) {

    showLoader()
    const notiData = {
      title : data.title,
      body : data.body,
      description : data.description,
      timeStamp : Date.now()
    } 
    sendNewNotification(notiData).then(async()=> {
      hideLoader()
      showSnackbar('Notification Sent Successfully')
    }).catch(async() => {
      hideLoader()
      showSnackbar('Failed to send Notifications, please contact admin', 'error')
    })
  }

  return (
    <div>
      <Box p={2} className={classes.whiteBg}>
          <h2 className={classes.center}>Send New Notification</h2>
          <form onSubmit={handleSubmit(onFormSubmit)}>

            <Box mb={3}>
              <TextField
                placeholder="Enter Notification Title"
                label="Notification Title"
                variant="outlined"
                fullWidth
                name="title"
                {...register("title", {
                  required: "Required field"
                })}
                error={Boolean(errors?.title)}
                helperText={errors?.title?.message}
              />
            </Box>

            <Box mb={3}>
              <TextField
                placeholder="Enter Notification Body"
                label="Notification Body"
                variant="outlined"
                fullWidth
                name="body"
                multiline
                rows={4}
                {...register("body",{
                  required: "Required field"
                })}
                error={Boolean(errors?.body)}
                helperText={errors?.body?.message}
              />
            </Box>

            <Box mb={3}>
              <TextField
                placeholder="Enter notification description"
                label="Notification Description"
                variant="outlined"
                fullWidth
                name="description"
                multiline
                rows={4}
                {...register("description",{
                  required: "Required field"
                })}
                error={Boolean(errors?.description)}
                helperText={errors?.description?.message}
              />
            </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Send 
          </Button>
        </form>
        </ Box>
    </div>
  )
}

export default SendNotification
