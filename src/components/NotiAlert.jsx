import React from 'react'

const styles = {
  notiCont : {
    display : 'flex',
    flexDirection : 'column',
    minWidth:'200px'
  },
  title : {
    fontSize : '20px',
    marginBottom:'10px'
  },
  body : {
    fontSize:'22px',
    marginBottom:'10px',
    color:'black'
  },
  description: {
    fontSize: '22px'
  }
}

function NotiAlert({props}) {
  return (
    <div style={styles.notiCont}>
      <div style={styles.title}>
        {props.title}
      </div>
      <div style={styles.body}>
        {props.body}
      </div>
      <div style={styles.description}>
        {props.data.description}   
      </div>
    </div>
  )
}

export default NotiAlert
