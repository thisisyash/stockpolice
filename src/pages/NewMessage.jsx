import React, {useContext, useEffect, useState} from 'react'
import { Button, Box, Paper, TextField } from '@mui/material'
import { CommonContext } from '../contexts/CommonContext'
import ComponentLoader from '../components/ComponentLoader'
import { useForm } from "react-hook-form";
import Modal from '@mui/material/Modal';
import { createNewGroup, createNewUser, deleteUserApi, getGroups, getInputTheme, getUsersByGroup } from '../services/api';
import { getFirebaseError } from '../services/error-codes';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { updateUserData  } from '../services/api';
import { makeStyles } from "@mui/styles";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';


const styles = {
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
    color:'white',
    padding:'20px',
    borderRadius:'5px',
    width:'80vw',
    maxWidth:'700px'
  },
  groupsListCont : {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    paddingBottom:'10px'
  },
  groupCont : {
    padding:'15px',
    cursor:'pointer'
  },
  pointerItem : {
    cursor:'pointer'
  },
  disabled : {
    pointerEvents:'none',
    opacity:'0.5'
  },
  centerTitle : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:0
  }
}
const useStyles = makeStyles((theme) => ({
  ...getInputTheme()
}))

function NewMessage() {

  const classes = useStyles()
  const navigate = useNavigate()
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const { register : registerGroup, handleSubmit : submitGroup, reset : resetGroup, formState : {errors:groupErrors} } = useForm()
  const { register : registerUser, handleSubmit : submitUser, reset : resetUser, formState : {errors:userErrors} } = useForm()
  const [groupModal, setGroupModal] = React.useState(false)
  const [userModal, setUserModal] = React.useState(false)
  const [deleteModal, setDeleteModal] = React.useState(false)
  const [activeGroup, setActiveGroup] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [editUser, setEditUser] = useState(false)
  

  useEffect(() => {
    getAllGroups()
  }, [])

  const getAllGroups = () => {
    getGroups().then((response => {
      setGroups(response)
      setLoading(false)
    }))
  }

  const setNewActiveGroup = (groupId) => {
    setActiveGroup(groupId)
    showLoader()
    getUsersByGroup(groupId).then((users) => {
      setUsers(users)
      setFilteredUsers(users)
      hideLoader()
    }).catch((error) => {
      showSnackbar(getFirebaseError(error), 'error')
      hideLoader()
    })
  }

  const requestSearch = (searchedVal) => {
    const filteredRows = users.filter((row) => {
      return (row.userName?.toLowerCase().includes(searchedVal.toLowerCase()) 
              || row.clientCode?.toLowerCase().includes(searchedVal.toLowerCase()))
              || row.mobileNo?.toLowerCase().includes(searchedVal.toLowerCase())
    })
    setFilteredUsers(filteredRows)
  }

  return (
    <>
      {
        loading ? <ComponentLoader /> :
        <Box p={2}>
          <h2 style={styles.centerTitle}>Send New Message</h2>
          <Box>
            <h4>Please select a group</h4>
            {
              groups.length ?
              <Box>
                <Box  style={styles.groupsListCont}>
                  {
                    groups.map((group) => {
                      return(
                      <Box key={group.groupId} onClick={() => setNewActiveGroup(group.groupId)}>
                        <Paper style={{...styles.groupCont, backgroundColor : group.groupId == activeGroup ? 'rgb(98 197 255)' : null}}>
                          {group.name}
                        </Paper>
                      </Box>)
                    })
                  }
                </Box>
                {
                  activeGroup ? <Box>
                    <p>Select a user to send message</p>
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
                        className={classes.inputBox}
                        autoComplete='off'
                        name="searchValue"
                      />
                    </Box>
                    <Box sx={{marginTop:2}}>
                      {
                        filteredUsers.length ? <Box>
                  
                                <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align="left">User Name</TableCell>
                                      <TableCell align="left">Mobile Number</TableCell>
                                      <TableCell align="left">Client Code</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredUsers.map((row) => (
                                      <TableRow
                                        key={row.mobileNo}
                                        onClick={() => navigate(`/userChat`, {state:{mobileNumber:row.mobileNo, userName : row.userName}})}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                      >
                                        <TableCell align="left">{row.userName}</TableCell>
                                        <TableCell align="left">{row.mobileNo}</TableCell>
                                        <TableCell align="left">{row.clientCode}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                        </Box> : 
                          <Box>
                            <h5>No Users Found</h5>
                          </Box>
                      }
                    </Box>
                  </Box> : null
                }
              </Box>
               : 
              <Box style={styles.groupsListCont}>
                No Groups Found
              </Box>
            }
          </Box>
        </Box>
      }
    </>
  )
}

export default NewMessage
