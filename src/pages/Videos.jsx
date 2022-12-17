import React, { useContext, useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { Button, Box, Paper, TextField, Checkbox} from '@mui/material'
import { CommonContext } from '../contexts/CommonContext';
import { getGlobals, getInputTheme, saveVideosApi } from '../services/api';
import ComponentLoader from '../components/ComponentLoader';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  ...getInputTheme()
}))

function Videos() {

  const classes = useStyles()
  const { register : registerVideo, handleSubmit : submitVideo, reset : resetVideo, formState : {errors:videoErrors} } = useForm()
  const [videos, setVideos] = useState([])
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getVideos()
  }, [])

  const getVideos = () => {
    getGlobals().then((resp) => {
      setVideos(resp.videoLinks)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      showAlert("Some error occured")
    })
  } 

  const addNewVideo = (data) => {
    if (!data.videoLink) return
    let videoArr = videos || []
    videoArr.push(data.videoLink)
    setVideos(videoArr)
    resetVideo()
  }

  const removeVideo = (videoLink) => {
    let tempVideos = videos.slice(0)
    tempVideos.splice(videos.indexOf(videoLink), 1);
    setVideos(tempVideos)
  }
  
  const saveVideos = () => {
    showLoader()
    saveVideosApi(videos).then(() => {
      hideLoader()
      showSnackbar("Videos added successfully")
    }).catch(() => {
      hideLoader()
      showAlert("Failed to add videos")
    })
  }

  return (
    <>
      {
      loading ?
      <ComponentLoader /> : 
      <Box p={2}>
        <h2>Home Page Videos</h2>
        {
          videos?.length ?
            <Box>
              {
                videos.map((video, index) => {
                  return(
                    <Box key={index} sx={{margin:'20px 10px', width:'100%', 
                                          display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <Box sx={{wordWrap:"break-word", maxWidth:'65vw'}}>
                        {video}
                      </Box>
                      <Button onClick={() => removeVideo(video)}
                        variant="outlined" sx={{marginLeft:'10px', height:'fit-content'}}>
                        X
                      </Button>
                    </Box>
                  )
                })
              }
            </Box>
            :
            <Box sx={{margin:'10px 0'}}>
              <h2>
                No videos added
              </h2>
            </Box>
        }
          <form onSubmit={submitVideo(addNewVideo)}>
            <Box mb={3} sx={{display:'flex', alignItems:'center'}}>
              <TextField
                placeholder="Enter youtube video link"
                label="Enter Youtube Video Link"
                variant="outlined"
                required
                className={classes.inputBox}
                name="videoLink"
                {...registerVideo("videoLink",{
                pattern: {
                  value: /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/i,
                  message: "Invalid video link",
                }})}
                error={Boolean(videoErrors?.videoLink)}
                helperText={videoErrors?.videoLink?.message}
              />
              <Button type="submit" variant="contained" sx={{marginLeft:'10px'}}>
                Add
              </Button>
            </Box>
            </form>
            <Button onClick={saveVideos} variant="contained">
              Save Videos
            </Button>
      </Box>
      }
    </>
  )
}

export default Videos
