import React, {useContext, useEffect, useRef, useState} from 'react'
import { Button, Box, Paper , Grid, TextField} from '@mui/material'
import { AuthContext } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { getUserData, getInputTheme } from '../services/api'
import ComponentLoader from '../components/ComponentLoader'
import { collection, where, onSnapshot, query, setDoc, doc, orderBy, updateDoc } from "firebase/firestore";
import { db } from '../firebase'
import PersonIcon from '@mui/icons-material/Person';
import { makeStyles } from "@mui/styles";
import stockpolice from '../assets/stockpolice.png'

const styles = {
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginTop:'0px',
    fontSize:'15px'
  },
	messageItem: {
		border:'1px solid white',
		cursor:'pointer',
		padding:'5px',
		display:'flex',
    flexDirection:'column',
    width:'min-content',
		justifyContent:'space-between',
		alignItems:'center',
    margin:'10px',
    background:'white',
    color:'black',
    borderRadius:'10px',
    width:'auto'
	}
}



const useStyles = makeStyles((theme) => ({
  ...getInputTheme(),
  logoImg : {
    width : '15px',
    height:'15px',
    borderRadius:'50%'
  }
}))


function UserChat() {

  const classes = useStyles()
  const {logout, isUserAdmin, getUserId} = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [userMsg, setUserMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({})
  const messagesEndRef = useRef(null)
  const [userMobileNo, setUserMobileNo] = useState('')

  useEffect(() => {

    const currentChatMobileNo = location?.state?.mobileNumber || getUserId()

    setUserMobileNo(currentChatMobileNo)
    getUserData(currentChatMobileNo, true).then((response => {
      setUserData(response)
    }))

    const q = query(collection(db, `chats/${location?.state?.mobileNumber || getUserId()}/messages`), orderBy('timeStamp', 'asc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = []
      querySnapshot.forEach((doc) => {
        messages.push(doc.data())
      })
      setMessages(messages)
      setLoading(false)
      
      setTimeout(() => {
        scrollToBottom()
      }, 500)
    })

  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMsg = async() => {

      const msgData = {
        message   : userMsg,
        timeStamp : Date.now(),
        isAdmin   : await isUserAdmin()
      }

      if (!messages.length) {
        const initialData  = {
          mobileNumber    : userMobileNo,
          unreadAdminMsgs : await isUserAdmin() ? 0 : 1,
          unreadUserMsgs  : await isUserAdmin() ? 1 : 0,
          userName        : userData.userName
        }
        const userCollRef = collection(db, 'chats')
        setDoc(doc(userCollRef, userMobileNo+''), initialData).then((querySnapshot) => {
          setDoc(doc(collection(db, `chats/${userMobileNo}/messages`)), msgData)
        }).catch((error)=> {

        })

      } else {
        setDoc(doc(collection(db, `chats/${userMobileNo}/messages`)), msgData)
      }
      
      setUserMsg('')
      scrollToBottom()
  }

  return (
    <>
    {
      loading ? <ComponentLoader /> :
      <>
      <Box sx={{paddingTop:'2vh'}}>
      <h2 style={styles.center}>{location?.state?.userName || 'Admin'}</h2>
      </Box>
        <Box p={2} sx={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'80vh'}}>  
            {
						messages.length ? 
						<Box sx={{height:'75vh', overflow:'scroll', paddingBottom:'5px', display:'flex', flexDirection:'column',}}>
							{
								messages.map((message, index) => {
									return <Box style={styles.messageItem} key={index}
                          sx={{alignSelf:isUserAdmin() == message.isAdmin ? 'flex-end': 'flex-start'}} 
										onClick={() => navigate('/usermessage', {state:message})}>
										<Box sx={{display:'flex', alignItems:'center', 
                              flexDirection: isUserAdmin() == message.isAdmin ? 'row-reverse' : 'row'  }}>
											<Box sx={{border:'1px solid white', borderRadius:'50%', padding:'2px', display:'flex'}}>
                        <Box>
                          {
                            message.isAdmin ? 
                            <img src={stockpolice} className={classes.logoImg}  /> : <PersonIcon fontSize='small' /> 
                          } 
                          </Box>                           
											</Box>
											<Box sx={{fontSize:'15px', marginLeft:'10px',marginRight:'10px'}}>
												{message.message} 
											</Box>
										</Box>
                    <Box sx={{fontSize:'10px', textAlign:'right', width:'100%', color:'grey'}}>
                    {new Date(message.timeStamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                    </Box>
									</Box>
								})
							}
              <div ref={messagesEndRef}></div>
						</Box> :
						<Box>
							No messages Found
						</Box>
					}
          <Box sx={{display:'flex', justifyContent:'space-between', paddingTop:'15px'}}>
            <TextField
              placeholder="Enter Message"
              label="Send Message"
              variant="outlined"
              size='small'
              type="text"
              value={userMsg}
              fullWidth
              className={classes.inputBox}
              autoComplete='off'
              name="message"
              onChange={(e) => setUserMsg(e.target.value)}
            />
            <Button
              sx={{marginLeft:'10px'}}
              onClick={() => sendMsg()}
              variant='contained'>
              Send
            </Button>

          </Box>
        </Box>
      </>
    }
    </>
  )
}

export default UserChat
