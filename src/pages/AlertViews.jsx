import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { Button, Box, Paper, TextField, Grid, Container, Icon} from '@mui/material'
import { makeStyles } from "@mui/styles";
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import { useLocation } from 'react-router-dom';


const useStyles = makeStyles((theme) => ({

}))

function AlertViews() {

  const classes  = useStyles()
  const location = useLocation()
  const {getUserId, logout, isUserAdmin} = useContext(AuthContext)

  useEffect(() => {

  }, [])


  return (
    <>
      <Box sx={{background:'black', padding:'4vw'}}>
        <h2 className={classes.center}>Alert Views</h2>
        <Grid>
            {
              location.state.alertViews && location.state.alertViews.length ? 
              <>
                {
                  location.state.alertViews.map((view) =>{ return (
                    <Paper sx={{padding:'10px', marginBottom:'10px', display:'flex'}}>
                      <Box sx={{width:'35%'}}>
                        {view.name} 
                      </Box>
                      <Box sx={{width:'30%', textAlign:'center'}}>
                        {view.clientCode} 
                      </Box>
                      <Box sx={{width:'30%', textAlign:'right'}}>
                        {view.viewedOn}
                      </Box>                                         
                    </Paper>
                  )})
                }
              </> : 
              <Paper  sx={{padding:'10px'}}>
                No Views Found
              </Paper>
            }
          </Grid>
      </Box>    
    </>
  )
}

export default AlertViews
