import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { CommonContext } from '../contexts/CommonContext'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const styles = {
  loader : {
    position : 'absolute',
    width : '100vw',
    height : '100vh',
    background : 'white',
    opacity:0.6,
    left : '0',
    top : '0',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    zIndex:1400,
    flexDirection:'column'
  }
}
function FullPageLoader() {
  const {loader, loadingText, snackbar, hideSnackbar, snackbarText, snackbarType, setSnackbarType } = useContext(CommonContext)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    hideSnackbar()
    setSnackbarType('success')
  };

  return (
    <>
      {
        loader ? 
        <div style={styles.loader}> 
        <Box sx={{ display: 'flex', marginBottom:2 }}>
          <CircularProgress />
        </Box>
          { loadingText }
        </div> 
        : null
      }
      {
        <Snackbar open={snackbar} autoHideDuration={3000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={snackbarType} sx={{ width: '100%' }}>
            {snackbarText}
          </Alert>
        </Snackbar>        
      }
      <Outlet />
    </>
    )
}

export default FullPageLoader
