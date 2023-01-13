import React, {useContext, useEffect, useState} from 'react'
import { Button, Box, Paper , Grid} from '@mui/material'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getUserData } from '../services/api'
import ComponentLoader from '../components/ComponentLoader'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ImageLoader from '../components/ImageLoader'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const styles = {
  userCard : {
    display:'flex',
    flexDirection:'column'
  },
  profilePic : {
    width:'30vw',
    height:'30vw',
    border: '1px solid #b8b8b8',
    marginTop:'15px',
    borderRadius:'50%'
  },
  defIcon: {
    fontSize:'100px'
  },
  profilePicCont : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontSize:'25vw'
  },
  menuItem: {
    padding:'10px', 
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between'
  },
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginTop:'0px'
  }
}

function Profile() {

  const {logout} = useContext(AuthContext)
  const navigate = useNavigate()
  const [userData, setUserData] = useState({})
  const {getUserId} = useContext(AuthContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserData(getUserId(), true).then((response => {
      if (response.multiLoginError) {
          logout(response)
          return
      }
      setUserData(response)
      setLoading(false)
    }))
  }, [])

  const logoutUser = () => {
    logout({deviceToken : userData.deviceToken, groups : userData.groups})
  }

  return (
    <>
    {
      loading ? <ComponentLoader /> :
      <>
      <Box p={2}>
        <h2 style={styles.center}>My Profile</h2>
        <Paper style={styles.userCard}>
          <div style={styles.profilePicCont}> 
            {
              userData?.profilePicUrl ?
              <ImageLoader props={{imgUrl:userData.profilePicUrl, styles:styles.profilePic}}/>
               :
              <AccountCircleIcon style={styles.defIcon}/>
            }
          </div>

          <Box sx={{p:2}}>
            <Box sx={{mb:1, mt:1,}}>
              <b>Name : </b> {userData.userName}
            </Box>
            {/* <Box sx={{mb:1, mt:1,}}>
              <b>Email : </b> {userData.email}
            </Box> */}
            <Box sx={{mb:1, mt:1,}}>
              <b>Mobile : </b> {userData.mobileNo}
            </Box>
            <Box sx={{mb:1, mt:1,}}>
              <b>Profile Status : </b> {userData.isActive ? 'Active' : 'InActive'}
            </Box>
            <Box sx={{mb:1, mt:1,}}>
              <b>Alerts : </b> {userData.isNotiEnabled ? 'Enabled' : 'Disabled'}
            </Box>
            <Box sx={{mb:2, mt:1,}}>
              <b>Mobile : </b> {userData.mobileNo}
            </Box>
            <Box sx={{display:'flex'}}>
              <Button variant="outlined" size="medium" 
                onClick={logoutUser}>
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Box sx={{textAlign:'center'}}>
        {process.env.NODE_ENV == 'development' ? 'THIS IS TESTING APP' : null}
        <br />
        App Version : {process.env.REACT_APP_VERSION}
      </Box>
      </>
    }
    </>
  )
}

export default Profile
