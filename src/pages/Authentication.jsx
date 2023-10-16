import React, { useContext, useState, useEffect } from 'react'
import { TextField, Button, Box, createMuiTheme, useTheme } from '@mui/material'
import { useForm } from "react-hook-form";
import { makeStyles } from "@mui/styles";
import { CommonContext } from '../contexts/CommonContext';
import { auth } from '../firebase'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getInputTheme, getUserData, registerToken, setUserData, unRegisterToken, updateUserData } from '../services/api';
import { getFirebaseError } from '../services/error-codes';
import stockpolice from '../assets/stockpolice_white.png'
import {
  PushNotifications,
} from '@capacitor/push-notifications';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';


const useStyles = makeStyles((theme) => ({
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  whiteBg : {
    // background:'white !important',
    height:'100vh',
    display:'flex',
    width:'-webkit-fill-available',
    maxWidth:'420px',
    flexDirection:'column',
    textAlign:'center',
    background:'gray'
  },
  outerCont : {
    display:'flex',
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
    p: 4
  },
  appointmentBox : {
    background : 'white',
    padding:'20px',
    borderRadius:'5px'
  },
  logoImg : {
    width : '150px',
    height:'150px'
  },
  logoImgCont : {
    textAlign : 'center',
    paddingTop:'2vh'
  },
  ...getInputTheme()
}));


function Authentication(props) {

  const classes = useStyles()

  const [showSignIn, setShowSignIn] = useState(true)
  const [mobileNo, setMobileNo] = useState(null)
  const [deviceToken, setDeviceToken] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [isNotiEnabled, setIsNotiEnabled] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otpResult, setOtpResult] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)

  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const {userLoggedIn, setUserProfileData, isUserLoggedIn, setUserAsAdmin, setDeviceTokenCookie} = useContext(AuthContext)

  const { register, handleSubmit, control, reset, formState : {errors:errors} } = useForm()
  const { register : registerOtp, handleSubmit : submitOtp, reset : resetOtp, formState : {errors:errorsOtp} } = useForm()

  const navigate = useNavigate()

  useEffect(() => {

    //To remove chatbot on login page
    // const chatBot = document.getElementById("tiledesk-container")
    // if (chatBot) chatBot.remove()
    
    if(isUserLoggedIn()) {
      navigate("/", {replace:true})
    }
    if(showOtp) {
      setUpRecaptha('+91'+userProfile.mobileNo).then((response) => {
        console.log("recaptcha response", response)
        setOtpResult(response)
        setIsCaptchaVerified(true)
        }).catch((error) => {
          console.log('Error', error)
      })
    }
  }, [showOtp])

  function setUpRecaptha(number) {
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {},
      auth
    );
    recaptchaVerifier.render();
    return signInWithPhoneNumber(auth, number, recaptchaVerifier);
  }
  
  const loginUser = (data) => {
    showLoader()
    setMobileNo(data.mobileNo)

    getUserData(data.mobileNo, false).then((response => {

      //User created
      if (response) {
        if (response.clientCode != data.clientCode.toUpperCase()) {
          showAlert("Incorrect client code")
          hideLoader()
          return
        }
        setUserProfile(response)
        setShowOtp(true)
      } else {
        showAlert(<>
          User account is not registered. 
          <Button variant="outlined" sx={{marginTop:1}} 
            onClick={() => whatsappMe("8374190096")}>
            Contact Admin 
            <WhatsAppIcon sx={{marginLeft:2}}/>
          </Button>
        </>)
      }
      hideLoader()
    })).catch((error) => {
      hideLoader()
      showAlert(getFirebaseError(error))
    })    
  }

  const subscribePushNotification = (groups) => {

    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        // Show some error
      }
      PushNotifications.createChannel({id:'alarm', name:'alarm', importance:5,visibility:1, sound:'mysound.mp3'})
    })

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token) => {

        setDeviceToken(token.value)
        updateUserData({deviceToken : token.value}, userProfile.mobileNo).then(() => {
          console.log("Updated new device token : ", token.value)
          setDeviceTokenCookie(token.value)  
        }).catch((error) => {
          showAlert("Failed to activate notifications. Please contact admin.")
        })

        if (userProfile.deviceToken && userProfile.deviceToken != token.value) {

          unRegisterToken(userProfile.deviceToken, groups).then(async()=> {
            console.log("Removing device from notifications : ", userProfile.deviceToken)
            hideLoader()
          }).catch(async(error) => {
            hideLoader()
            showAlert("Some unexpected error occured")
          })
        }

        registerToken(token.value, groups).then(async()=> {
          console.log("Subscribing device for notifications : ", token.value)
          hideLoader()
        }).catch(async(error) => {
          hideLoader()
          showAlert("Some unexpected error occured")
        })

      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error) => {
        console.log("Error in setting up notifications")
      }
    );
  }

  const verifyOtp = async(data) => {
    showLoader()
    try {
      await otpResult.confirm(data.otp)
      if (userProfile?.isAdmin) setUserAsAdmin()
      userLoggedIn(userProfile.mobileNo)
      setUserProfileData(userProfile)
      subscribePushNotification(userProfile.groups)
      hideLoader()
      showSnackbar("Login successful")
      navigate('/', {replace:true})
    } catch (err) {
      hideLoader()
      showAlert(getFirebaseError(err.message))
    }
  }

  const whatsappMe = (number) => {
    window.open(`https://wa.me/91${number}`, '_blank')
  }

  return (
    <div className={classes.outerCont}>
    <div className={classes.whiteBg}>
    <div className={classes.logoImgCont}>
      <img src={stockpolice} className={classes.logoImg} />
    </div>
    {
      showSignIn ?
      <>        
      <Box p={2}>
        <h2 className={classes.center}>Login</h2>
        {
          showOtp ? 
          <Box sx={{textAlign:'center'}}>
            <Box sx={{display : isCaptchaVerified ? 'none' : 'block'}}>
              <h5>Please verify captcha to send OTP</h5>  
              <div id="recaptcha-container"></div>
            </Box>
            {
              isCaptchaVerified ? 
              <>
                <form onSubmit={submitOtp(verifyOtp)}>
                  <h5>Enter otp sent to your registered mobile number</h5>
                  <Box mb={3}>
                    <TextField
                      placeholder="Enter OTP"
                      label="OTP Number"
                      variant="outlined"
                      fullWidth
                      type="number"
                      className={classes.inputBox}
                      autoComplete='off'
                      name="otp"
                      {...registerOtp("otp", {
                        required: "Required field"})}
                      error={Boolean(errorsOtp?.otp)}
                      helperText={errorsOtp?.otp?.message}
                    />
                  </Box>
                  <Button type="submit" variant="contained" color="primary" fullWidth id='sign-in-button'>
                    Verify OTP
                  </Button>
                </form>
              </> : null
            }

          </Box> :

          <Box>   
            <form onSubmit={handleSubmit(loginUser)} key={1}>
            <Box mb={3}>
                <TextField
                  placeholder="Enter your mobile number"
                  label="Mobile Number"
                  variant="outlined"
                  fullWidth
                  autoComplete='off'
                  className={classes.inputBox}
                  type="number"
                  name="mobileNo"
                  {...register("mobileNo", {
                    required: "Required field",
                    pattern: {
                      value: /^[7896]\d{9}$/,
                      message: "Invalid mobile number",
                    },
                  })}
                  error={Boolean(errors?.mobileNo)}
                  helperText={errors?.mobileNo?.message}
                />
              </Box>

              <Box mb={3}>
                <TextField
                  placeholder="Enter your client code"
                  label="Client Code"
                  variant="outlined"
                  fullWidth
                  autoComplete='off'
                  className={classes.inputBox}
                  name="clientCode"
                  {...register("clientCode", {
                    required: "Required field"
                  })}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                  error={Boolean(errors?.clientCode)}
                  helperText={errors?.clientCode?.message}
                />
              </Box>
              <Button type="submit" variant="contained" color="primary" fullWidth id='sign-in-button'>
                Log In 
              </Button>
            </form>
            <Button variant="outlined" sx={{marginTop:5}} 
              onClick={() => whatsappMe("8374190096")}>
              Contact Admin 
              <WhatsAppIcon sx={{marginLeft:2}}/>
            </Button>
          </Box>
        }
        
      </Box>
      </>
      :
      <Box p={2}>

      </Box>
    }
    </div>
    </div>
  )
}

export default Authentication
