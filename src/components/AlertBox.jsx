import React, { useContext } from 'react'
import { CommonContext } from '../contexts/CommonContext'
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Outlet } from 'react-router-dom'
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import {Box} from '@mui/material';


function AlertBox() {
  const { alert, alertText, setAlert } = useContext(CommonContext)

  const handleClose = () => {
    setAlert(false);
  };


  return (
    <>
      <Dialog open={alert}>
        <DialogTitle>
          <Box sx={{borderBottom:'1px solid #3c3c3c'}}>
            Alert
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{color:'white'}}>
            {alertText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Outlet />
    </>
  )
}

export default AlertBox
