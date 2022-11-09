import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, increment, orderBy, where, deleteDoc } from "firebase/firestore";
import { db } from '../firebase'
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

let userDataCache = null

export const setUserData = (async(userData) => {
  const userCollRef = collection(db, 'users')

  return new Promise((resolve, reject)=> {
    setDoc(doc(userCollRef, userData.uid), userData).then((querySnapshot) => {
      resolve(userData)
    }).catch((error)=> {
      reject(error)
    })
  })
})

export const createNewUser = (async(userData) => {
  return new Promise(async(resolve, reject) => {
    const orderResp = await fetch("https://stockpolice-server.herokuapp.com/createNewuser", {
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "accept": "application/json"
      },
      "body": JSON.stringify({
        userData : userData
      })
    }).then((response) => response.json())
    .then(function(data) { 
      resolve(data)
    })
    .catch((error) => {
      console.log(error)
      reject(error)
    }); 
  })
})

export const deleteUserApi = ((userData) => {
  const userCollRef = collection(db, 'users')
  return new Promise((resolve, reject)=> {
    deleteDoc(doc(userCollRef, userData.mobileNo)).then((querySnapshot) => {
      resolve(userData)
    }).catch((error)=> {
      reject(error)
    })
  })
})

// Should remove id and fetch from cookie
export const getUserData = (async(id) => {
  // console.log("getting user data for : ", id)
  if (userDataCache) 
  {
    if (userDataCache.mobileNo == id) {
      // console.log("User cache exists : ", userDataCache)
      return userDataCache
    }
  }
  
  return new Promise((resolve, reject)=> {
    getDoc(doc(db, `users/${id}`)).then((querySnapshot) => {
      resolve(querySnapshot.data())
      //TODO - remove
      userDataCache = querySnapshot.data()
    }).catch((error)=> {
      reject(null)
    })
  })
})

export const removeUserCache = (() => {
  userDataCache = null
})

export const getUserDataByUrl = (async(id) => {

  return new Promise((resolve, reject)=> {
    getDocs(query(collection(db, "users"), where("userUrlId", "==", id))).then((querySnapshot) => {
      let userData = null
      querySnapshot.forEach((doc) => {
        userData = doc.data()
      })
      if (userData)
        resolve(userData)
      else  
        reject(null)
    }).catch((error) => {
      reject(error)
    })
  })
})

export const updateUserData = (async(userData, uid) => {
  const userCollRef = collection(db, 'users')
  return new Promise((resolve, reject)=> {
    updateDoc(doc(userCollRef, uid), userData).then((querySnapshot) => {
      resolve(userData)
      removeUserCache()
    }).catch((error)=> {
      reject(error)
    })
  })
})

export const uploadImage = (async(fileData, fileMetadata, fileName, path) => {
  const storage = getStorage();
  const storageRef = ref(storage, `${path}/${fileName}`);

  let metadata = {
    contentType: fileMetadata.type,
  };

  return new Promise((resolve, reject) => {
    uploadBytes(storageRef, fileData, metadata).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        resolve(downloadURL)
      })
    })
  })
})

export const sendNewNotification = (async(data) => {
  return new Promise(async(resolve, reject) => {
    const orderResp = await fetch("https://stockpolice-server.herokuapp.com/sendNotification", {
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "accept": "application/json"
      },
      "body": JSON.stringify(data)
    }).then((response) => response.json())
    .then(function(data) { 
      resolve(data)
    })
    .catch((error) => {
      console.log(error)
      reject(error)
    }); 
  })
})


export const registerToken = (async(tokenId, groups) => {
  console.log("=======register token====", tokenId, groups)
  return new Promise(async(resolve, reject) => {
    const orderResp = await fetch("https://stockpolice-server.herokuapp.com/subscribe", {
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "accept": "application/json"
      },
      "body": JSON.stringify({
        tokenId : tokenId,
        groups : groups
      })
    }).then((response) => response.json())
    .then(function(data) { 
      resolve(data)
    })
    .catch((error) => {
      console.log(error)
      reject(error)
    }); 
  })
})

export const getAlerts = (async(fromTs, toTs) => {
  return new Promise((resolve, reject) => {
    getDocs(query( collection(db, `alerts`),
                   where('timeStamp', '<', toTs),
                   where('timeStamp', '>', fromTs), 
                   orderBy('timeStamp', 'desc')
                 )
            ).then((querySnapshot) => {
      let eventItems = []
      querySnapshot.forEach((doc) => {
        eventItems.push(doc.data())      
      })
      resolve(eventItems)
    }).catch(()=> {
      reject([])
    })
  })
})

export const createNewGroup = (async(groupData) => {
  const groupCollRef = collection(db, 'groups')
  const groupId = doc(groupCollRef).id
  groupData.groupId = groupId
  return new Promise((resolve, reject)=> {
    setDoc(doc(groupCollRef, groupId), groupData).then((querySnapshot) => {
      resolve({})
    }).catch((error)=> {
      reject(error)
    })
  })
})

export const getGroups = (async() => {
  return new Promise((resolve, reject) => {
    getDocs(query(collection(db, `groups`))).then((querySnapshot) => {
      let eventItems = []
      querySnapshot.forEach((doc) => {
        eventItems.push(doc.data())      
      })
      resolve(eventItems)
    }).catch((error)=> {
      reject(error)
    })
  })
})

export const getUsersByGroup = (async(groupId) => {
  return new Promise((resolve, reject) => {
    getDocs(query(collection(db, `users`),  where("groups", "array-contains", groupId))).then((querySnapshot) => {
      let eventItems = []
      querySnapshot.forEach((doc) => {
        eventItems.push(doc.data())      
      })
      resolve(eventItems)
    }).catch((error)=> {
      reject(error)
    })
  })
})