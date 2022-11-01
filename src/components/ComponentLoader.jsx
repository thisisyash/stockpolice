import React from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const styles = {
  loader : {
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'column',
    height:'-webkit-fill-available'
  }
}

function ComponentLoader({title}) {
  return (
    <div style={styles.loader}> 
      <Box sx={{ display: 'flex', marginBottom:2 }}>
        <CircularProgress />
      </Box>
      {/* Loading... Please wait */}
    </div> 
  )
}

export default ComponentLoader
