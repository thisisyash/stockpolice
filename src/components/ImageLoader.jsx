import React, {useState} from 'react'
import loader from '../assets/loading.gif'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const styles = {
  loader: {
    position:'absolute'
  },
  noVisibility : {
    // visibility:'hidden'
  },
  visible : {
    visibility : 'block'
  },
  loaderImgCont : {
    position: 'relative',
    top: 0,
    left: 0,
  }
}
function ImageLoader({props}) {

  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div style={styles.loaderImgCont}>
    {
      props.imgUrl ?
      <>
        { !imgLoaded && <img src={loader} style={{...props.styles, ...styles.loader}} className={props.className}/> }
        <img src={props.imgUrl} style={{...props.styles, ...styles.noVisibility}} 
        className={props.className} onLoad={ () => setImgLoaded(true)}/>
      </>
       :
      <AccountCircleIcon style={props.styles} className={props.className}/>
    }
    </div>
  )
}

export default ImageLoader
