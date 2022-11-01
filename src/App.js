import logo from './logo.svg';
import './App.css';
import Authentication from './pages/Authentication';
import { CommonProvider } from './contexts/CommonContext';
import { Routes, Route } from 'react-router-dom';
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
import ManageUsers from './pages/ManageUsers';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <CookiesProvider>
    <CommonProvider>
      <AuthContextProvider>
      <Routes>
        <Route element={<FullPageLoader />} >
          <Route element={<AlertBox />} >
            <Route path="/auth" element={<Authentication />}/>

            <Route element={<RequireAuth />} >

              <Route path="/" element={<HomePage />}/>
              <Route path="/alerts" element={<Alerts />}/>
              <Route path="/profile" element={<Profile />}/>

              <Route path="/uploadContacts" element={<UploadContacts />}/>
              <Route path="/sendNotification" element={<SendNotification />}/>
              <Route path="/manageUsers" element={<ManageUsers />}/>
              <Route path="/adminPanel" element={<AdminPanel />}/>

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
