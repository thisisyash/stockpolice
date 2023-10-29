import React, { useContext, useEffect, useState } from 'react'
import { TextField, Button, Box, Card, Paper, Grid, FormControl } from '@mui/material'
import { makeStyles } from "@mui/styles";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from '../contexts/AuthContext';
import { CommonContext } from '../contexts/CommonContext';
import { getGroups, getInputTheme, sendNewNotification, updateAlertImageLinks, uploadAlertNotificationImage } from '../services/api';
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
  // whiteBg : {
  //   background:'white !important',
  //   height:'-webkit-fill-available'
  // },
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

function SendNotification() {

  const classes = useStyles()
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm()
  const [userData, setUserData] = useState({})
  const { getUserId } = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [alertBody, setAlertBody] = useState(null)
  const [body, setBody] = useState(null)
  const [fileLink, setFileLink] = useState(null)
  const [fileType, setFileType] = useState(null)

  const [showImageBox, setShowImageBox] = useState(true);
  const [showVideoBox, setShowVideoBox] = useState(true);
  const [showExcelBox, setShowExcelBox] = useState(true);
  
  

  useEffect(() => {
    getGroups().then((response => {
      setGroups(response)
      setLoading(false)
    }))
  }, [])

  const handleChange = (event) => {
    setSelectedGroup(event.target.value)
  }


  function remove(){
    showLoader()
    setFileLink('')
    setFileType('')
    setShowImageBox(true)
    setShowVideoBox(true)
    setShowExcelBox(true)
    hideLoader()

  }

  const handleQuillChange = (content, delta, source, editor) => {
    // Get the HTML value from the ReactQuill content
    const htmlValue = editor.getHTML();

    // Get the text value (without HTML tags) from the ReactQuill content
    const textValue = editor.getText();

    // Set the state with the HTML value
    setAlertBody(htmlValue);
    setBody(textValue);
    // Now you have both the HTML and text values
    console.log('HTML Value:', htmlValue);
    console.log('Text Value:', textValue);
  };

  async function handleProductImgUpload(e,filetype) {
    var fileName='';
     console.log("===test143===",filetype)
     const file = e.target.files[0];
     if (filetype == "IMAGE") {
      if (file) {
        // Define an array of allowed file extensions
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      // Get the file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        fileName = `alert-${Date.now()}.jpg`
        setShowImageBox(true);
        setShowVideoBox(false);
        setShowExcelBox(false);
      } else {
        // File is not of an allowed format, so you can show an error message or take appropriate action
        showSnackbar('Invalid file format. Allowed formats: jpg, jpeg, png, gif', 'error');
        e.target.value = '';
        setFileLink('');
        hideLoader()
        return; // Clear the input field
      }
      }
      
    } else if (filetype == "VIDEO") {
      const file = e.target.files[0];
      if (file) {
        const allowedFormats = ['mp4', 'avi', 'mov', 'mkv', 'wmv'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (allowedFormats.includes(fileExtension)) {
          fileName = `alert-${Date.now()}.mp4`
          setShowImageBox(false);
          setShowVideoBox(true);
          setShowExcelBox(false);
          // You can handle the selected video file here or upload it to a server
        } else {
          // File is not of an allowed format, so you can show an error message or take appropriate action
          showSnackbar('Invalid video format. Allowed formats: mp4, avi, mov, mkv, wmv', 'error');
          e.target.value = ''; // Clear the input field
          setFileLink('');
          hideLoader()
          return;
        }
      }
      
    }else if(filetype == "EXCEL"){
      const file = e.target.files[0];
      if (file) {
        const allowedFormats = ['xlsx', 'pdf'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (allowedFormats.includes(fileExtension)) {
          fileName = `alert-${Date.now()}.xlsx`
          setShowImageBox(false);
          setShowVideoBox(false);
          setShowExcelBox(true); 
        } else {
          showSnackbar('Invalid file format. Allowed formats: xlsx (Excel) and pdf (PDF)', 'error');
          e.target.value = ''; // Clear the input field
          setFileLink('');
          hideLoader()
          return;
        }
      }
      
    }
    setFileType(filetype);
    console.log("==test143==148",fileName)
    showLoader()
    
    uploadAlertNotificationImage(await e.target.files[0].arrayBuffer(), e.target.files[0], fileName, 'alert').then((downloadUrl) => {
      setFileLink(downloadUrl)
      hideLoader()
    })
  }

  function onFormSubmit(data) {

   

    showLoader()
    const notiData = {
      // title : data.title,
      //videoLink:videoLink,
      fileType:fileType,
      fileLink:fileLink,
      body: body,
      topic: selectedGroup,
      description : data.description,
      newBody:alertBody,  
      timeStamp: Date.now()
    }
    console.log("=====test123",notiData)
    sendNewNotification(notiData).then(async () => {
      hideLoader()
      showSnackbar('Notification Sent Successfully')
    }).catch(async () => {
      hideLoader()
      showSnackbar('Failed to send Notifications, please contact admin', 'error')
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
                <h5>Please select a group to send notification</h5>
                {
                  groups?.length ?
                    <Box sx={{ maxWidth: 120, border:'1px solid white', borderRadius:'5px'}}>
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
                    <Box>
                      <h5>Enter notification data</h5>
                      <form onSubmit={handleSubmit(onFormSubmit)}>

                        {/* <Box mb={3}>
                  <TextField
                    placeholder="Enter Notification Title"
                    label="Notification Title"
                    variant="outlined"
                    fullWidth
                    name="title"
                    {...register("title", {
                      required: "Required field"
                    })}
                    error={Boolean(errors?.title)}
                    helperText={errors?.title?.message}
                  />
                </Box> */}

                        <Box mb={15} style={{ display: "grid", justifyContent: "left", height: 300 }}>
                          {/* <TextField
                    placeholder="Enter Notification Body"
                    label="Notification Body"
                    variant="outlined"
                    fullWidth
                    name="body"
                    className={classes.inputBox}
                    multiline
                    rows={4}
                    {...register("body",{
                      required: "Required field"
                    })}
                    error={Boolean(errors?.body)}
                    helperText={errors?.body?.message}
                  /> */}
                          {/* <div className='container'>
                      <div className='row'>
                        <div className='editor'>
                          <div className='preview'> */}
                          {/* <div > */}
                          
                          <ReactQuill
                            theme="snow"
                            modules={modules}
                            formats={formats}
                            value={alertBody}
                            placeholder="Enter notification description...."
                            //onChange={setAlertBody}
                            onChange={handleQuillChange}
                            
                            style={{ height: "220" }}
                            name="body"
                            // {...register("body", {
                            //   required: "Required field"
                            // })}
                            // error={Boolean(errors?.body)}
                            // helperText={errors?.body?.message}
                          >
                          </ReactQuill>
                          {/* </div> */}
                          {/* </div>
                            </div>
                          </div>
                        </div> */}
                        </Box>
                        {showImageBox && (<Box mb={3}>
                          {fileLink?
                          
                          <Box sx={{wordWrap:"break-word", maxWidth:'100vw'}}>
                          {fileLink}
                          </Box>:''}
                          {fileLink?
                          
                          <Button onClick={() => remove()}
                            variant="outlined" sx={{marginLeft:'14rem',marginBottom:'6px', height:'fit-content'}}>
                             X
                          </Button>:''}
                          <Button sx={{width:'100%'}}
                            variant="contained"
                            component="label">
                            Upload image
                            <input  
                              name="alertimgageLink"
                              onChange={(event) => handleProductImgUpload(event, 'IMAGE')}
                              //onChange={handleProductImgUpload}
                              type="file"
                              hidden
                            />
                          </Button>
                        </Box>)}
                        {showVideoBox && (<Box mb={3}>
                          {fileLink?
                          
                          <Box sx={{wordWrap:"break-word", maxWidth:'100vw'}}>
                          {fileLink}
                          </Box>:''}
                          {fileLink?
                          
                          <Button onClick={() => remove()}
                            variant="outlined" sx={{marginLeft:'14rem',marginBottom:'6px', height:'fit-content'}}>
                             X
                          </Button>:''}
                          <Button sx={{width:'100%'}}
                            variant="contained"
                            component="label">
                            Upload Video
                            <input  
                              name="alertVideoLink"
                              onChange={(event) => handleProductImgUpload(event, 'VIDEO')}
                              //onChange={handleProductImgUpload}
                              type="file"
                              hidden
                            />
                          </Button>
                        </Box>)}
                        {showExcelBox && (<Box mb={3}>
                          {fileLink?
                          
                          <Box sx={{wordWrap:"break-word", maxWidth:'100vw'}}>
                          {fileLink}
                          </Box>:''}
                          {fileLink?
                          
                          <Button onClick={() => remove()}
                            variant="outlined" sx={{marginLeft:'14rem',marginBottom:'6px', height:'fit-content'}}>
                             X
                          </Button>:''}
                          <Button sx={{width:'100%'}}
                            variant="contained"
                            component="label">
                            Upload Excel
                            <input  
                              name="alertExcelLink"

                              onChange={(event) => handleProductImgUpload(event, 'EXCEL')}
                              type="file"
                              hidden
                            />
                          </Button>
                        </Box>)}
                        {/* <Box mb={3}>
                        <TextField sx={{width:'100%'}}
                              placeholder="Enter youtube video link"
                              label="Enter Youtube Video Link"
                              variant="outlined"
                              required
                              
                              name="alertvideoLink"
                              
                              onChange={setvideoLink}
                              
                            />
                        </Box> */}
                        {/* <Box mb={3}>
                  <TextField
                    placeholder="Enter notification description"
                    label="Notification Description"
                    variant="outlined"
                    fullWidth
                    name="description"
                    multiline
                    rows={4}
                    {...register("description",{
                      required: "Required field"
                    })}
                    error={Boolean(errors?.description)}
                    helperText={errors?.description?.message}
                  />
                </Box> */}

                        <Button type="submit" variant="contained" color="primary" fullWidth>
                          Send
                        </Button>


                      </form>
                    </ Box> : null
                }
              </Box>
            </Box>
          </>
      }
    </>
  )
}

export default SendNotification
