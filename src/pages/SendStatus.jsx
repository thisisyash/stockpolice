import React, { useContext, useEffect, useState } from 'react'
import { TextField, Button, Box, Card, Paper, Grid, FormControl } from '@mui/material'
import { makeStyles } from "@mui/styles";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from '../contexts/AuthContext';
import { CommonContext } from '../contexts/CommonContext';
import { getGroups, getInputTheme, sendNewNotification, sendNewStatus, updateAlertImageLinks, uploadAlertNotificationImage } from '../services/api';
import ComponentLoader from '../components/ComponentLoader';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const useStyles = makeStyles((theme) => ({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0
  },
 
  prodImg: {
    height: '30vw',
    width: '30vw'
  },
  notiCont: {
    maxWidth: '800px'
  }
}))

var formats = [
  "header", "height", "bold", "italic",
  "underline", "strike", "blockquote",
  "list", "color", "bullet", "indent",
  //"link", "image", "align", "size",
  "link", "align", "size",
];

var modules = {
  toolbar: [
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
   // ["link", "image"],
   ["link"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
      { align: [] }
    ],
    [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
  ]
};

const fileTypemode=['IMAGE','VIDEO','EXCEL']

function SendStatus() {

  const classes = useStyles()
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm()
  const [userData, setUserData] = useState({})
  const { getUserId } = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [alertBody, setAlertBody] = useState(null)
  const [body, setBody] = useState(null)
  const [fileLink, setFileLink] = useState(null)
  const [fileType, setFileType] = useState(null)

  useEffect(() => {

    getGroups().then((response => {
      setGroups(response)
      setLoading(false)
    }))

  }, [])

  const handleChange = (event) => {
    console.log("==data==",event.target.value);
    setSelectedGroup(event.target.value)
    
  }


  function remove(){

    showLoader()
    setFileLink(null)
    setFileType(null)
    hideLoader()


  }

  const handleQuillChange = (content, delta, source, editor) => {

    const htmlValue = editor.getHTML();
    const textValue = editor.getText();
    // setAlertBody(htmlValue);
    setBody(htmlValue);

  };

  async function handleProductImgUpload(e,filetype) {

    var fileName='';
    const file = e.target.files[0];
    if (filetype == "IMAGE") {

      if (file) {

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (allowedExtensions.includes(fileExtension)) {

          fileName = `alert-${Date.now()}.jpg`

        } else {
      
          showSnackbar('Invalid file format. Allowed formats: jpg, jpeg, png, gif', 'error');
          e.target.value = '';
          setFileLink('');
          hideLoader()
          return; 
        }
      }
      
    } 
    setFileType(filetype);
    showLoader()
    
    uploadAlertNotificationImage(await e.target.files[0].arrayBuffer(), e.target.files[0], fileName, 'alert').then((downloadUrl) => {

      setFileLink(downloadUrl)
      hideLoader()

    })

  }

  function onFormSubmit(data) {

    showLoader()

    const notiData = {
      fileLink:fileLink,
      body: body,
      topic: selectedGroup, 
      timeStamp: Date.now()
    }
   
    sendNewStatus(notiData).then(async () => {
      hideLoader()
      showSnackbar('Status Sent Successfully')
    }).catch(async () => {
      hideLoader()
      showSnackbar('Failed to send Status, please contact admin', 'error')
    })
  }

  return (
    <>
      {
        loading ? <ComponentLoader /> :
          <>
            <h2 className={classes.center}>Send New Notification</h2>
            <Box p={2} className={classes.whiteBg}>
              <Box className={classes.notiCont}>
                <h5>Please select a type of status</h5>
                {
                 
                    <Box sx={{ maxWidth: 120, border:'1px solid white', borderRadius:'5px'}}>
                      <FormControl fullWidth>
                        <Select
                          autoWidth
                          value={selectedGroup}
                          onChange={handleChange}>
                          <MenuItem key="image" value="image">Image</MenuItem>
                          <MenuItem key="desc" value="desc">Description</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                }

                {
                  selectedGroup !=null ?
                    <Box>
                      <h5>Enter Status data</h5>
                      <form onSubmit={handleSubmit(onFormSubmit)}>
                        {
                          selectedGroup =='desc' ?
                          
                          <Box mb={15} style={{ display: "grid", justifyContent: "left", height: 300 }}>
                            
                            <ReactQuill
                              theme="snow"
                              modules={modules}
                              formats={formats}
                              value={body}
                              placeholder="Enter status description...."
                              onChange={handleQuillChange}
                              style={{ height: "220" }}
                              name="body"
                            >
                            </ReactQuill>
                          
                          </Box> 
                            :
                          <Box mb={3}>
                            {
                              fileLink?

                                <Box sx={{wordWrap:"break-word", maxWidth:'100vw'}}>

                                  IMAGE added Successfully

                                  <Button onClick={() => remove()}
                                    variant="outlined" sx={{float:'right',marginBottom:'15px', height:'fit-content'}}>

                                    X

                                  </Button>

                                </Box>
                                :
                                null
                            }
                            
                            <Button sx={{width:'100%'}}
                              variant="outlined"
                              component="label">

                              Upload image

                              <input  
                              name="alertimgageLink"
                              onChange={(event) => handleProductImgUpload(event, 'IMAGE')}
                              type="file"
                              hidden
                              />

                            </Button>
                          </Box>
                        }
                        

                        
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                          Send
                        </Button>

                      </form>
                    </ Box> 
                    :
                    null
                }
              </Box>
            </Box>
          </>
      }
    </>
  )
}

export default SendStatus
