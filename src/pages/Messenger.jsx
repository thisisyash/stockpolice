import React, {useContext, useEffect, useState} from 'react'
import { Button, Box, Paper , Grid, TextField} from '@mui/material'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getChats, getUserData, getInputTheme } from '../services/api'
import ComponentLoader from '../components/ComponentLoader'
import PersonIcon from '@mui/icons-material/Person';
import UserImg from '../assets/user.png'
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { makeStyles } from "@mui/styles";


const styles = {
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginTop:'0px'
  },
	chatItem: {
		border:'1px solid white',
		cursor:'pointer',
		padding:'10px',
		display:'flex',
		justifyContent:'space-between',
		alignItems:'center',
		borderRadius:'5px',
		marginBottom:'10px'
	}
}
const useStyles = makeStyles((theme) => ({
  ...getInputTheme()
}))

function Messenger() {

	const classes = useStyles()
  const {logout, isUserAdmin} = useContext(AuthContext)
  const navigate = useNavigate()
  const [chatData, setChatData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const {getUserId} = useContext(AuthContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getChats().then((response => {
      setChatData(response)
	  setFilteredData(response)
      setLoading(false)
    }))
  }, [])

	const requestSearch = (searchedVal) => {
    const filteredRows = chatData.filter((row) => {
      return (row.userName?.toLowerCase().includes(searchedVal.toLowerCase()) 
              || row.clientCode?.toLowerCase().includes(searchedVal.toLowerCase()))
              || row.mobileNo?.toLowerCase().includes(searchedVal.toLowerCase())
    })
    setFilteredData(filteredRows)
  }

  return (
    <>
    {
      loading ? <ComponentLoader /> :
      <>
        <Box p={2}>
					<Box sx={{display:'flex', justifyContent:'space-between'}}>	
						<Box sx={{width:'20%'}}>
						</Box>
						<h2 style={styles.center}>Chats</h2>
						<Button sx={{marginLeft:'20px'}}
							onClick={() => navigate('/newMessage')}>New</Button>
					</Box>
					
					<Box mt={3}>
							<TextField
								placeholder="Enter user name"
								label="Search Users"
								variant="outlined"
								fullWidth
								type="text"
								onChange={(e) => requestSearch(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon sx={{color:'white'}} />
										</InputAdornment>
									),
								}}
								sx={{marginBottom:'20px'}}
								className={classes.inputBox}
								autoComplete='off'
								name="searchValue"
							/>
						</Box>
					{
						chatData.length ? 
						<Box>
							{
								filteredData.map((chat) => {
									return <Box style={styles.chatItem}
										onClick={() => navigate('/userChat', {state:chat})}>
										<Box sx={{display:'flex', alignItems:'center'}}>
											<Box sx={{borderRadius:'50%', padding:'2px'}}>
												<PersonIcon fontSize='small' />
												{/* <img src={UserImg}  /> */}
											</Box>
											<Box sx={{fontSize:'20px', marginLeft:'10px'}}>
												{chat.userName} 
											</Box>
										</Box>
										
										<Box sx={{background:'white', borderRadius:'50%', color:'black', marginRight:'10px',
															width:'20px',height:'20px',textAlign:'center'}}>
											{/* {isUserAdmin() ? chat.unreadAdminMsgs : chat.unreadUserMsgs} */}
										</Box>
									</Box>
								})
							}
						</Box> :
						<Box>
								No Chats Found
						</Box>
					}
        </Box>
      </>
    }
    </>
  )
}

export default Messenger
