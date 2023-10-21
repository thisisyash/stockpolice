import React, { useContext, useEffect, useState } from 'react'
import { TextField, Button, Box, Card, Paper, Grid, FormControl } from '@mui/material'
import { makeStyles } from "@mui/styles";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from '../contexts/AuthContext';
import { CommonContext } from '../contexts/CommonContext';
import { getGroups, getInputTheme, sendNewNotification } from '../services/api';
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
  "link", "image", "align", "size",
];

var modules = {
  toolbar: [
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
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
  const [bodyvalue, setBodyValue] = useState(null)

  useEffect(() => {
    getGroups().then((response => {
      setGroups(response)
      setLoading(false)
    }))
  }, [])

  const handleChange = (event) => {
    setSelectedGroup(event.target.value)
  }

  function onFormSubmit(data) {

    showLoader()
    const notiData = {
      // title : data.title,
      body: data.body,
      topic: selectedGroup,
      description : data.description,
      timeStamp: Date.now()
    }
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
                            value={bodyvalue}
                            placeholder="Enter notification description...."
                            onChange={setBodyValue}
                            style={{ height: "220" }}
                            name="description"
                            // {...register("description", {
                            //   required: "Required field"
                            // })}
                            // error={Boolean(errors?.description)}
                            // helperText={errors?.description?.message}
                          >
                          </ReactQuill>
                          {/* </div> */}
                          {/* </div>
                            </div>
                          </div>
                        </div> */}
                        </Box>

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
