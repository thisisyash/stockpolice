import React, { useContext, useEffect, useState } from 'react'
import { saveAs } from 'file-saver' // Import file-saver library
import ComponentLoader from '../components/ComponentLoader'
import { AuthContext } from '../contexts/AuthContext'
import XLSX from 'xlsx'

import {
  Button,
  Box,
  Paper,
  TextField,
  Grid,
  Container,
  Icon,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import { useLocation } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({}))

function StatusViews() {
  const classes = useStyles()
  const location = useLocation()
  const { getUserId, logout, isUserAdmin } = useContext(AuthContext)
  const [viewsData, setViewsData] = useState([])

  useEffect(() => {
    // Set viewsData when the component mounts or when location.state.statusViews changes
    if (location.state.statusViews) {
      setViewsData(location.state.statusViews)
    }
  }, [location.state.statusViews])

  const handleDownloadExcel = () => {
    // Convert viewsData to Excel format (you may need to use a library like xlsx for this)
    // For example, let's assume viewsData is an array of objects and each object represents a row
    const excelData = viewsData.map((view) => ({
      Name: view.name,
      ClientCode: view.clientCode,
      ViewedOn: view.viewedOn,
      mobileNo:view.mobileNo
    }))

    // Create a new workbook and add a worksheet
    const XLSX = require('xlsx')
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Create a new workbook with the worksheet
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'StatusViewsData')

    // Save the workbook as an Excel file
    const excelFileName = 'StatusViewsData.xlsx'
    XLSX.writeFile(wb, excelFileName)

    // Trigger file download using file-saver
    // saveAs(new Blob([excelFileName]), excelFileName)
  }

  return (
    <>
      <Box sx={{ background: 'black', padding: '4vw' }}>
        <h2 className={classes.center}>Status Views ({viewsData?.length})</h2>
        <Box mb={3}>
          <Button onClick={() => handleDownloadExcel()} variant="contained" color="primary" fullWidth 
            sx={{mt:2}}>
            Download Excel
          </Button>
        </Box>
        <Grid>
          {viewsData.length ? (
            viewsData.map((view, index) => (
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
            ))
          ) : (
            <Paper sx={{ padding: '10px' }}>No Views Found</Paper>
          )}
        </Grid>

        
      </Box>
    </>
  )
}

export default StatusViews
