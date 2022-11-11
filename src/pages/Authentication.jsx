import React, { useContext, useState, useEffect } from 'react'
import { TextField, Button, Box } from '@mui/material'
import { useForm } from "react-hook-form";
import { makeStyles } from "@mui/styles";
import { CommonContext } from '../contexts/CommonContext';
import { auth } from '../firebase'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getUserData, registerToken, setUserData } from '../services/api';
import { getFirebaseError } from '../services/error-codes';
import stockpolice from '../assets/stockpolice.png'
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
    background:'white !important',
    height:'100vh',
    display:'flex',
    width:'-webkit-fill-available',
    maxWidth:'420px',
    flexDirection:'column',
    textAlign:'center'
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
  }
}));


function Authentication() {

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
  const {userLoggedIn, setUserProfileData, isUserLoggedIn, setUserAsAdmin} = useContext(AuthContext)

  const { register, handleSubmit, control, reset, formState : {errors:errors} } = useForm()
  const { register : register2, handleSubmit : handleSubmit2, reset : reset2, formState : {errors:errors2} } = useForm()
  const { register : registerOtp, handleSubmit : submitOtp, reset : resetOtp, formState : {errors:errorsOtp} } = useForm()

  const navigate = useNavigate()

  useEffect(() => {
  //   window.recaptchaVerifier = new RecaptchaVerifier(
  //     "recaptcha-container", {
  //         size: "invisible",
  //         callback: function(response) {
  //             console.log("Captcha Resolved");
  //         },
  //         defaultCountry: "IN",
  //     }
  // );
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

    getUserData(data.mobileNo).then((response => {
      console.log(response, data)

      //User created
      if (response) {

        if (response.clientCode !== data.clientCode) {
          showAlert("Incorrect client code")
          hideLoader()
          return
        }

        setUserProfile(response)
        setShowOtp(true)
        // const appVerifier = window.recaptchaVerifier;

        // auth
        //     .signInWithPhoneNumber(data.mobileNo, appVerifier)
        //     .then((confirmationResult) => {
        //         // SMS sent. Prompt user to type the code from the message, then sign the
        //         // user in with confirmationResult.confirm(code).
        //         console.log("otp sent");
        //         setShowOtp(true);
        //         hideLoader()
        //         window.confirmationResult = confirmationResult;
        //     })
        //     .catch((error) => {
        //         // Error; SMS not sent
        //         // ...
        //         hideLoader()
        //         showAlert(error.message);
        //     });


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
        console.log('push notification request granted')
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        console.log("============",'push notification error')
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token) => {
        setDeviceToken(token.value)
        console.log("===============", token.value, groups)
        registerToken(token.value, groups).then(async()=> {
          console.log("=========push token registration sucess")
          hideLoader()
        }).catch(async(error) => {
          console.log("=========push token registration failed", error)
          hideLoader()
        })
        console.log("===============", 'Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error) => {
        alert("=================", 'Error on registration: ' + JSON.stringify(error));
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

  const signupUser = (data) => {
    console.log("signup user")
    showLoader()
    const userData = {
      uid          : mobileNo,
      userName     : data.userName,
      userUrlId    : data.userName.split(' ').join('-'),
      email        : data.email,
      createdAt    : Date.now(),
      isNotiEnabled : isNotiEnabled || false,
      isActive     : isActive || false,
      isProfileCompleted : true,
      mobileNo     : mobileNo,
      deviceToken  : deviceToken
    }

    setUserData(userData).then(() => {
      setUserProfileData(userData)
      userLoggedIn(userData.mobileNo)
      hideLoader()
      navigate('/', {replace:true})
    }).catch((error) => {
      hideLoader()
      showAlert(getFirebaseError(error.code))
    })
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
          </Box>
        }
        
      </Box>
      </>
      :
      <Box p={2}>
        <h2 className={classes.center}>Welcome to StockPolice, Please update your details</h2>
        <form onSubmit={handleSubmit2(signupUser)} key={2}>

        {/* <Box mb={3}>
            <TextField
              label="Mobile Number"
              variant="outlined"
              fullWidth
              disabled
              defaultValue={mobileNo}
              autoComplete='off'
              name="mobileNo"
              {...register2("mobileNo")}
            />
          </Box> */}

          <Box mb={3} mt={5}>
            <TextField
              placeholder="Enter your full name"
              label="Full Name"
              variant="outlined"
              fullWidth
              autoComplete='off'
              name="userName"
              {...register2("userName", {
                required: "Required field"
              })}
              error={Boolean(errors2?.userName)}
              helperText={errors2?.userName?.message}
            />
          </Box>

          <Box mb={3}>
            <TextField
              placeholder="Enter your email"
              label="Email ID"
              variant="outlined"
              fullWidth
              autoComplete='off'
              name="email"
              {...register2("email", {
                required: "Required field",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              error={Boolean(errors2?.email)}
              helperText={errors2?.email?.message}
            />
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth id='sign-in-button'>
            Continue
          </Button>
        </form>
      </Box>
    }
    </div>
    </div>
  )
}

export default Authentication
