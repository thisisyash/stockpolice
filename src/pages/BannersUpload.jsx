import React,  {useContext, useEffect, useState} from 'react'
import ComponentLoader from '../components/ComponentLoader'
import { TextField, Button, Box, Card, Paper, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from "@mui/styles";
import { useForm, Controller } from "react-hook-form";
import { getGlobals, getUserData, updateBannerLinks, updateUserData, uploadImage } from '../services/api'
import { AuthContext } from '../contexts/AuthContext';
import { CommonContext } from '../contexts/CommonContext';
import Modal from '@mui/material/Modal';

const useStyles = makeStyles((theme) => ({
  center : {
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  // whiteBg : {
  //   height:'-webkit-fill-available'
  // },
  prodImg: {
    height:'30vw',
    margin:'20px',
    width:'30vw'
  }
}))

const styles = {
  modalStyle : {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display:'flex',
    justifyContent:'center'
  },
  appointmentBox : {
    background : 'black',
    color:'white',
    padding:'20px',
    borderRadius:'5px',
    width:'80vw',
    maxWidth:'700px'
  }
}

function BannersUpload() {

  const classes = useStyles()
  const [loading, setLoading] = useState(true)
  // const [userData, setUserData] = useState({})
  const {getUserId} = useContext(AuthContext)
  const { showLoader, hideLoader, showAlert, showSnackbar } = useContext(CommonContext)
  const [linkModal, setLinkModal] = React.useState(false)
  const { register : registerLink, handleSubmit : submitLink, reset : resetLink, formState : {errors:linkErrors} } = useForm()
  const [activeImgIndex, setActiveImgIndex] = useState(null)
  const [imgUrls, setImgUrls] = useState([])

  useEffect(() => {

    getGlobals().then((resp) => {
      setImgUrls(resp.bannerLinks)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      showAlert("Some error occured")
    })

    // getUserData(getUserId()).then((response => {
    //   setUserData(response)
    //   setLoading(false)
    // }))
  }, [])

  function removeProuctImg(imgUrl) {
    showLoader()
    // const galleryData = {
    //   gallery : {
    //     imgUrls : userData.gallery.imgUrls.filter(img => img != imgUrl)
    //   }
    // }
    let newImgUrls = imgUrls.filter(img => img != imgUrl)
    updateGalleryData(newImgUrls, true, imgUrl)
  }

  async function handleProductImgUpload(e) {
    showLoader()
    const fileName = `banner-${getUserId()}-${Date.now()}.jpg`
    uploadImage(await e.target.files[0].arrayBuffer(), e.target.files[0], fileName, 'banners').then((downloadUrl) => {
      // let data = {}
      // data.imgUrls = userData?.gallery?.imgUrls || []
      // console.log(userData, data)
      // data.imgUrls.push(downloadUrl)
      
      let newImgUrls = imgUrls || []
      setImgUrls(newImgUrls.push(downloadUrl))
      updateGalleryData(newImgUrls,false, downloadUrl)
    })
  }

  function updateGalleryData(galleryData) {
    updateBannerLinks(galleryData).then(async()=> {
      hideLoader()
      setImgUrls(galleryData)
      // if(isRemove) 
      //   userData.gallery.imgUrls = userData.gallery.imgUrls.filter(img => img != imgUrl)  
      // if (!userData.gallery)  
      //   userData.gallery = galleryData.gallery
      showSnackbar('Banner images updated successfully')
      resetLink()
      setLinkModal(false)
    }).catch(async(error) => {
      hideLoader()
      resetLink()
      showSnackbar('Failed to update banner images', 'error')
    })
  }

  const addLink = (index) => {
    console.log(index)
    setActiveImgIndex(index)
    setLinkModal(true)
  }

  const createLink = (data) => {
    let newImgUrls = imgUrls
    let existingImgUrl = imgUrls[activeImgIndex].split('@@@@@')[0]
    existingImgUrl = `${existingImgUrl}@@@@@${data.linkurl}`
    newImgUrls[activeImgIndex] = existingImgUrl
    showLoader()
    updateGalleryData(newImgUrls)
  }

  return (
    <>

    <Modal
      open={linkModal}
      onClose={() => setLinkModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box style={styles.modalStyle}>
        <Box style={styles.appointmentBox}>
        <h4>Enter Banner Click URL</h4>

          <form onSubmit={submitLink(createLink)}>
            <Box mb={3} sx={{background:'white', padding:'10px'}}>
              <TextField
                placeholder="Enter Link"
                label="Link"
                variant="outlined"
                fullWidth
                autoFocus
                autoComplete='off'
                name="linkurl"
                {...registerLink("linkurl", {
                  required: "Required field"
                })}
                error={Boolean(linkErrors?.linkurl)}
                helperText={linkErrors?.linkurl?.message}
              />
            </Box>
            
            <Box>
              <Button variant="outlined" sx={{marginRight:2}}
                onClick={() => setLinkModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Box>
            
          </form>
        </Box>
      </Box>
    </Modal>

      {
        loading ? <ComponentLoader /> :
        <Box p={2} className={classes.whiteBg}>
          <h2 className={classes.center}>Update Banner Images</h2>
          <Box>
            <Button
              variant="contained"
              component="label">
              Upload new image
              <input
                onChange={handleProductImgUpload}
                type="file"
                hidden
              />
            </Button>
          </Box>
          <Box mb={10} mt={3}>
            {
              imgUrls && imgUrls.length ?
              imgUrls.map((img, index) => 
                <Paper sx={{marginBottom:'10px'}} key={img}>
                  <Box sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <img className={classes.prodImg} src={img} /> 
                  </Box>                  
                  <Box sx={{padding:'10px', display:'flex', justifyContent:'space-between'}}>
                    <Button
                      onClick={() => removeProuctImg(img)}
                      component="label">
                      Remove
                    </Button>
                    <Button 
                      onClick={() => addLink(index)}
                      variant="contained">
                      Add Link
                    </Button>
                  </Box>
                </Paper>                
              ) : null
            }
          </Box>
      </ Box>
      }
    </>
  )
}

export default BannersUpload
