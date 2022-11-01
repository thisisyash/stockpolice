import React from 'react'
import { Button, Box, Card, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ContactsIcon from '@mui/icons-material/Contacts';
import CampaignIcon from '@mui/icons-material/Campaign';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const styles = {
  contentCard : {
    height:130,
    width:130,
    display:'flex',
    flexDirection:'column',
    justifyContent:'space-around',
    padding:10,
    alignItems:'center'
  },

  infoCard : {
    height:100,
    marginBottom:10,
    display:'flex',
    flexDirection:'column',
    alignItems:'start',
    justifyContent:'space-between',
    padding:20
  },

  countText: {
    fontSize:40,
    textAlign:'center',
    fontWeight:'bold'
  },
  statusText: {
    fontSize:23,
    textAlign:'center',
    fontWeight:'bold'
  },
  logoImg :{
    height: '100px',
    width:'-webkit-fill-available'
  },
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  }
}

function AdminPanel() {

  const navigate = useNavigate()

  return (
    <>
       <Box p={2}>
       <h2 style={styles.center}>Admin Panel</h2>
        <Grid container spacing={3} justifyContent="center">

          <Grid item xs>
            <Paper style={styles.contentCard} onClick={() => navigate('/uploadContacts')}>
              <ContactsIcon 
              fontSize='large'/>
              <Button>
                Upload Contacts
              </Button>
            </Paper>
          </Grid>

          <Grid item xs>
            <Paper style={styles.contentCard} onClick={() => navigate('/sendNotification')}>
              <CampaignIcon 
              fontSize='large'/>
              <Button>
                Send Notification
              </Button>
            </Paper>
          </Grid>

          <Grid item xs>
            <Paper style={styles.contentCard} onClick={() => navigate('/manageUsers')}>
              <SupervisorAccountIcon 
              fontSize='large'/>
              <Button>
                Manage Users
              </Button>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </>
  )
}

export default AdminPanel
