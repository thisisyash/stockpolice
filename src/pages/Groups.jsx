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
    padding:'20px 0'
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

function Groups() {

  const classes = useStyles()
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

  const createUser = (data) => {
    showLoader()
    if (editUser) {
      updateUserData(data, data.mobileNo).then(() => {
        hideLoader()
        showSnackbar("User data updated successfully")
        setUserModal(false)
        setNewActiveGroup(activeGroup)
      }).catch((error) => {
        hideLoader()
        showAlert(getFirebaseError("Failed to update user data"))
      })
    } else {
      data.groups = [activeGroup]
      createNewUser(data).then(() => {
        hideLoader()
        showSnackbar("user created successfully")
        setUserModal(false)
        resetUser()
        setTimeout(() => {
          setNewActiveGroup(activeGroup)
        }, 700)
      }).catch((error) => {
        hideLoader()
        showAlert(getFirebaseError(error))
      })
    }
  }

  const createGroup = (data) => {
    const groupData = {
      name : data.groupName,
      timeStamp : Date.now()
    }
    showLoader()
    createNewGroup(groupData).then(() => {
      hideLoader()
      setGroupModal(false)
      showSnackbar("Group created successfully")
      setLoading(true)
      getAllGroups()
      resetGroup()
    }).catch((error) => {
      showSnackbar(getFirebaseError(error), "error")
    })
  }

  // const handleGroupChange = (event, groupId) => {
  //   if (event.target.checked) {
  //     if (!selectedGroups.includes(groupId)) {
  //       setSelectedGroups([...selectedGroups, groupId])
  //     } 
  //   } else {
  //     const index = selectedGroups.indexOf(groupId)
  //     if (index > -1) { 
  //       setSelectedGroups(selectedGroups.filter(item => item !== groupId)) 
  //     }
  //   }
  // }

  const modifyUser = (userData) => {
    setEditUser(true)
    setSelectedUser(userData)
    setUserModal(true)
  }

  const deleteUser = (userData) => {
    setSelectedUser(userData)
    setDeleteModal(true)
  }

  const confirmDeleteUser = () => { 
    showLoader()
    deleteUserApi(selectedUser, activeGroup).then(() => {
      setSelectedUser(null)
      hideLoader()
      setNewActiveGroup(activeGroup)
      setDeleteModal(false)
      showSnackbar("User deleted successfully !")
    }).catch((error) => {
      hideLoader()
      showSnackbar("Some error occured")
    })
  }

  const handleAddUser = () => {
    resetUser()
    setSelectedUser(null)
    setEditUser(false)
    setUserModal(true)
  }

  const getGroupName = (id) => {
    if (!id) return null
    return groups.filter((group) => group.groupId == id)[0].name + ' '
  }

  const closeUserModal = () => {
    setUserModal(false)
    resetUser()
  }

  const requestSearch = (searchedVal) => {
    const filteredRows = users.filter((row) => {
      return (row.userName.toLowerCase().includes(searchedVal.toLowerCase()) 
              || row.clientCode.toLowerCase().includes(searchedVal.toLowerCase()))
              || row.mobileNo.toLowerCase().includes(searchedVal.toLowerCase())
    })
    setFilteredUsers(filteredRows)
  }

  return (
    <>
    <Modal
      open={groupModal}
      onClose={() => setGroupModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box style={styles.modalStyle}>
        <Box style={styles.appointmentBox}>
        <h4>Create New Group</h4>

          <form onSubmit={submitGroup(createGroup)}>
            <Box mb={3}>
              <TextField
                placeholder="Enter group name"
                label="Group Name"
                variant="outlined"
                fullWidth
                autoFocus
                className={classes.inputBox}
                autoComplete='off'
                name="groupName"
                {...registerGroup("groupName", {
                  required: "Required field"
                })}
                error={Boolean(groupErrors?.groupName)}
                helperText={groupErrors?.groupName?.message}
              />
            </Box>
            
            <Box>
              <Button variant="outlined" sx={{marginRight:2}}
                onClick={() => setGroupModal(false)}>
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
    
    <Modal
      open={userModal}
      onClose={() => setUserModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box style={styles.modalStyle}>
        <Box style={styles.appointmentBox}>
          {
            editUser ?
            <h4>Edit User Details</h4> :
            <h4>Add New User for {getGroupName(activeGroup)}</h4>
          }

          <form onSubmit={submitUser(createUser)}>
            <Box mb={3}>
              <TextField
                placeholder="Enter user name"
                label="User Name"
                variant="outlined"
                fullWidth
                className={classes.inputBox}
                autoFocus
                defaultValue={selectedUser?.userName}
                autoComplete='off'
                name="userName"
                {...registerUser("userName", {
                  required: "Required field"
                })}
                error={Boolean(userErrors?.userName)}
                helperText={userErrors?.userName?.message}
              />
            </Box>

            <Box mb={3} style={editUser ? styles.disabled : null }>
              <TextField
                placeholder="Enter user mobile number"
                label="Mobile Number"
                variant="outlined"
                fullWidth
                className={classes.inputBox}
                autoComplete='off'
                name="mobileNo"
                defaultValue={selectedUser?.mobileNo}
                {...registerUser("mobileNo", {
                  required: "Required field",
                  pattern: {
                    value: /^[7896]\d{9}$/,
                    message: "Invalid mobile number",
                  },
                })}
                error={Boolean(userErrors?.mobileNo)}
                helperText={userErrors?.mobileNo?.message}
              />
            </Box>

            <Box mb={3}>
              <TextField
                placeholder="Enter client code"
                label="Client Code"
                variant="outlined"
                fullWidth
                className={classes.inputBox}
                defaultValue={selectedUser?.clientCode}
                autoComplete='off'
                name="clientCode"
                {...registerUser("clientCode", {
                  required: "Required field"
                })}
                error={Boolean(userErrors?.clientCode)}
                helperText={userErrors?.clientCode?.message}
              />
            </Box>

            {/* {
              editUser ? null : 
              <Box mb={3}>
                  <h4>Groups : </h4> 
                {
                  groups.map((group) => {
                    return(
                      <>
                      <Checkbox size="medium" onChange={(e) => handleGroupChange(e, group.groupId)} value={group.groudId} />{group.name}
                      </>
                    )
                  })
                }
              </Box>
            } */}

            <Box>
              <Button variant="outlined" sx={{marginRight:2}}
                onClick={closeUserModal}>
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

    <Modal
      open={deleteModal}
      onClose={() => setUserModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
        <Box style={styles.modalStyle}>
          <Box style={styles.appointmentBox}>
            <h4>Are you sure to delete {selectedUser?.userName} ?</h4>
            <Box>
              <Button variant="outlined" sx={{marginRight:2}}
                onClick={() => setDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary"
                onClick={confirmDeleteUser}>
                Confirm
              </Button>
            </Box>
          </Box>
        </Box>
    </Modal>

      {
        loading ? <ComponentLoader /> :
        <Box p={2}>
          <h2 style={styles.centerTitle}>Manage Groups / Users</h2>
          <Box>
            <h4>Groups</h4>
            <Button variant="contained" onClick={() => setGroupModal(true)} >
              Add New Group
            </Button>
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
                    <p>Displaying users for {getGroupName(activeGroup)} group</p>
                    <Button variant="contained" onClick={handleAddUser}>
                      Add New User
                    </Button>
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
                                      <TableCell align="right">User Name</TableCell>
                                      <TableCell align="right">Mobile Number</TableCell>
                                      <TableCell align="right">Client Code</TableCell>
                                      <TableCell align="right">Group</TableCell>
                                      <TableCell align="right">Modify</TableCell>
                                      <TableCell align="right">Delete</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {filteredUsers.map((row) => (
                                      <TableRow
                                        key={row.mobileNo}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                      >
                                        <TableCell align="right">{row.userName}</TableCell>
                                        <TableCell align="right">{row.mobileNo}</TableCell>
                                        <TableCell align="right">{row.clientCode}</TableCell>
                                        <TableCell align="right">{row.groups.map((groupId) => getGroupName(groupId))}</TableCell>
                                        <TableCell align="right" style={styles.pointerItem} onClick={() => modifyUser(row)}><BorderColorIcon /></TableCell>
                                        <TableCell align="right" style={styles.pointerItem} onClick={() => deleteUser(row)}><DeleteIcon /></TableCell>
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

export default Groups
