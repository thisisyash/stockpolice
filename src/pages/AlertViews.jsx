import React, {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import { Button, Box, Paper, TextField, Grid, Container, Icon} from '@mui/material'
import { makeStyles } from "@mui/styles"
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import { useLocation } from 'react-router-dom'
import { saveAs } from 'file-saver'
import XLSX from 'xlsx'



const useStyles = makeStyles((theme) => ({

}))

function AlertViews() {

  const classes  = useStyles()
  const location = useLocation()
  const {getUserId, logout, isUserAdmin} = useContext(AuthContext)
  const [alertViewsData, setAlertViewsData] = useState([])


  useEffect(() => {
    // Set alertViewsData when the component mounts or when location.state.alertViews changes
    if (location.state.alertViews) {
      setAlertViewsData(location.state.alertViews)
    }
  }, [location.state.alertViews])

  const handleDownloadExcel = () => {
    // Convert alertViewsData to Excel format (assuming alertViewsData is an array of objects)
    const excelData = alertViewsData.map((view) => ({
      Name: view.name,
      ClientCode: view.clientCode,
      viewedOn: view.viewedOn,
      mobileNo: view.mobileNo
    }))

    // Create a new workbook and add a worksheet
    const XLSX = require('xlsx')
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Create a new workbook with the worksheet
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'AlertViewsData')

    // Save the workbook as an Excel file
    const excelFileName = 'AlertViewsData.xlsx'
    XLSX.writeFile(wb, excelFileName)

    // Trigger file download using file-saver
    // saveAs(new Blob([excelFileName]), excelFileName)
  }


  return (
    <>
      <Box sx={{background:'black', padding:'4vw'}}>
        <h2 className={classes.center}>Read Receipts</h2>
        <Grid>
            {
              location.state.alertViews && location.state.alertViews.length ? 
              <>
                {
                  location.state.alertViews.map((view) =>{ return (
                    <Paper sx={{padding:'10px', marginBottom:'10px', display:'flex', flexDirection:'column'}}>
                      <Box sx={{display:'flex'}}>
                      <Box sx={{width:'35%'}}>
                        {view.name} 
                      </Box>
                      <Box sx={{width:'35%'}}>
                        {view.mobileNo} 
                      </Box>
                      <Box sx={{width:'30%', textAlign:'center'}}>
                        {view.clientCode} 
                      </Box>
                      </Box>
                      <Box>

                      <Box sx={{width:'100%',  mt:2, textAlign:'right'}}>
                        {view.viewedOn}
                      </Box> 
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
          <Box mb={3}>
            <Button onClick={handleDownloadExcel} variant="contained" color="primary" fullWidth
            sx={{mt:2}}>
              
              Download Excel
            </Button>
          </Box>
      </Box>    
    </>
  )
}

export default AlertViews
