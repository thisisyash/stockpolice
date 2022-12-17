import React from 'react'

function Messages() {

  const tileDeskUrl = "https://console.tiledesk.com/v2/chat/#/conversations-list"

  return (
    <>
      <iframe src={tileDeskUrl} height="98%" width="99%"/>
    </>
  )
}

export default Messages
