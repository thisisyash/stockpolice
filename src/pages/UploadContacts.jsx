import React, { useState } from 'react'

function UploadContacts() {

  const [fileData, setFileData] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    let formData = new FormData()
    formData.append('file', fileData)
    const response = await fetch('http://localhost:3600/uploadContacts', {
      method: 'POST',
      body: formData
    })
    if (response) {
      console.log(response)
    }
  }

  const handleFileChange = (e) => {
    setFileData(e.target.files[0])
  }

  return (
    <div>
       <form onSubmit={handleSubmit}>
        <input type='file' name='file' onChange={handleFileChange}></input>
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default UploadContacts
