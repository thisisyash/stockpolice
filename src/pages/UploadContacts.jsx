import React, {useContext, useEffect, useState} from 'react'
import { Button, Box, Paper, TextField, Checkbox, Input, InputLabel, FormControl} from '@mui/material'
import { getGroups } from '../services/api'
import { CommonContext } from '../contexts/CommonContext'
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ComponentLoader from '../components/ComponentLoader';

const styles = {
  centerTitle : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:0
  }
}

function UploadContacts() {

  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [loading, setLoading] = useState(true)
  const [fileData, setFileData] = useState('')
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    getGroups().then((response => {
      setGroups(response)
      setLoading(false)
    }))
  }, [])

  const handleChange = (event) => {
    setSelectedGroup(event.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let formData = new FormData()
    formData.append('file', fileData)
    formData.append('groupId', selectedGroup)
    showLoader()
    const response = await fetch('https://stockpolice-server.herokuapp.com/uploadContacts', {
      method: 'POST',
      body:formData 
    })
    if (response) {
      hideLoader()
      showAlert("Contacts uploaded successfully")
      console.log(response)
    }
  }

  const handleFileChange = (e) => {
    setFileData(e.target.files[0])
  }

  return (
    <>
      {
        loading ? <ComponentLoader /> :
        <Box p={2}>
        <h2 style={styles.centerTitle}>Upload Contacts</h2>
        <h5>Please select a group to upload contacts</h5>
          {
            groups?.length ?
              <Box sx={{ maxWidth: 120 }}>
                <FormControl fullWidth>
                  <Select
                    autoWidth
                    value={selectedGroup}
                    onChange={handleChange}>
                    {
                      groups.map((group) => {
                        return (
                          <MenuItem key={group.groupId} value={group.groupId}>{group.name}</MenuItem>
                        )
                      })
                    }
                  </Select>
                  </FormControl>
                </Box>
              :
              <Box>
                No Groups Found
              </Box>
          }
          {
            selectedGroup ?
            <>
              <h4> Bulk Upload contacts for {groups.filter((group) => group.groupId == selectedGroup)[0].name } group.
              Please select a XLSX file to continue</h4>
              <form onSubmit={handleSubmit}>
                <Input type='file' name='file' onChange={handleFileChange} 
                  sx={{marginRight:'10px'}}></Input>
                <Button type='submit' variant='contained' sx={{marginTop:2}}>Upload</Button>
              </form>
            </> : null
          }
        </Box>
      }
    </>

  )
}

export default UploadContacts
