import React from 'react'
import { Button, Box, Card, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ContactsIcon from '@mui/icons-material/Contacts';
import CampaignIcon from '@mui/icons-material/Campaign';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';

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

  // window.Tiledesk('hide')
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
            <Paper style={styles.contentCard} onClick={() => navigate('/groups')}>
              <SupervisorAccountIcon 
              fontSize='large'/>
              <Button>
                Groups
              </Button>
            </Paper>
          </Grid>

          <Grid item xs>
            <Paper style={styles.contentCard} onClick={() => navigate('/videos')}>
              <SubscriptionsIcon 
              fontSize='large'/>
              <Button>
                Videos
              </Button>
            </Paper>
          </Grid>

          {/* <Grid item xs>
            <Paper style={styles.contentCard} onClick={() => navigate('/messages')}>
              <QuestionAnswerIcon 
              fontSize='large'/>
              <Button>
                Messages
              </Button>
            </Paper>
          </Grid> */}

          <Grid item xs>
            <Paper style={styles.contentCard} onClick={() => navigate('/bannersUpload')}>
              <ViewCarouselIcon 
              fontSize='large'/>
              <Button>
                Banners
              </Button>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </>
  )
}

export default AdminPanel
