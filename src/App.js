import './App.css';
import Authentication from './pages/Authentication';
import { CommonProvider } from './contexts/CommonContext';
import { Routes, Route, useNavigate } from 'react-router-dom';
import FullPageLoader from './components/FullPageLoader';
import AlertBox from './components/AlertBox';
import RequireAuth from './components/RequireAuth';
import { AuthContextProvider } from './contexts/AuthContext';
import {CookiesProvider} from "react-cookie";
import HomePage from './pages/HomePage';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import UploadContacts from './pages/UploadContacts';
import SendNotification from './pages/SendNotification';
import AdminPanel from './pages/AdminPanel';
import Groups from './pages/Groups';
import Videos from './pages/Videos';
import Messages from './pages/Messages';
import BannersUpload from './pages/BannersUpload';
import { useEffect, useState } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { checkAppUpdates } from './services/api';
import { App as CapApp } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { PushNotifications } from '@capacitor/push-notifications';
import AlertViews from './pages/AlertViews';
import SendStatus from './pages/SendStatus';
import ViewStatus from './pages/ViewStatus';
import StatusViews from './pages/StatusViews';

let updateData = null

CapacitorUpdater.notifyAppReady()

function App() {

  const navigate = useNavigate()

  useEffect(() => {

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',(notification) => {
      navigate('/alerts')
    })

    CapApp.addListener('appStateChange', async({ isActive }) => {

      if (!isActive && updateData) {
          try {
            console.log("Initiated new app update in background")
            await CapacitorUpdater.set(updateData)
          } catch (err) {
            console.log("Failed to update app", err)
          }
      }
    })

    const checkNewAppVersions = async() => {

      console.log("Checking for new app versions. Current version : ", process.env.REACT_APP_VERSION)

      const versionData = {
        appVersion : process.env.REACT_APP_VERSION
      }

      checkAppUpdates(versionData).then(async(resp)=> {

        console.log("App update available. New version : ", resp.version)

        if (resp.action == 'UPDATE') {

          console.log("Downloading new app update : ", resp.version)
          
          let data = await CapacitorUpdater.download({
            version : resp.version,
            url : resp.url
          })
          updateData = data
        } else if (resp.action == 'FORCE_UPDATE') {
          //Show splash screen and update

        } else if (resp.action == 'IGNORE') {
          //Do nothing

        }
      }).catch(async(error) => {
        console.log("Error in app update api : ", JSON.stringify(error))
      })
    }    

    checkNewAppVersions()
  }, [])

  return (
    <CookiesProvider>
    <CommonProvider>
      <AuthContextProvider>
      <Routes>
        <Route element={<FullPageLoader />} >
          <Route element={<AlertBox />} >
            <Route path="/auth" element={<Authentication  />}/>

            <Route element={<RequireAuth />} >

              <Route path="/" element={<HomePage />}/>
              <Route path="/alerts" element={<Alerts />}/>
              <Route path="/profile" element={<Profile />}/>

              <Route path="/uploadContacts" element={<UploadContacts />}/>
              <Route path="/sendNotification" element={<SendNotification />}/>
              <Route path="/adminPanel" element={<AdminPanel />}/>
              <Route path="/groups" element={<Groups />}/>
              <Route path="/videos" element={<Videos />}/>
              <Route path="/messages" element={<Messages />}/>
              <Route path="/bannersUpload" element={<BannersUpload />}/>
              <Route path="/alertViews" element={<AlertViews />}/>
              <Route path="/sendStatus" element={<SendStatus />}/>
              <Route path="/viewStatus" element={<ViewStatus />}/>
              <Route path="/statusViews" element={<StatusViews />}/>


            </Route>

          </Route>
        </Route>
      </Routes>
      </AuthContextProvider>
    </CommonProvider>
    </CookiesProvider>
  );
}

export default App;
