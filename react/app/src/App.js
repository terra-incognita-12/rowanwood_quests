import "bootstrap/dist/css/bootstrap.min.css"
import { Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Logout from "./components/Auth/Logout"
import RequireAuth from "./components/Auth/RequireAuth"
import PersistLogin from "./components/Auth/PersistLogin"
import Main from "./components/Pages/Main"
import ForgetPass from "./components/Pages/ForgetPass"
import ChangePass from "./components/Pages/ChangePass"
import Unauthorized from "./components/Pages/Unauthorized"
import AdminPanel from "./components/Pages/AdminPanel"
 
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
            
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgetpass" element={<ForgetPass />} />
          <Route exact path="changepass/:token" element={<ChangePass />} />
          
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={['user', 'admin']} />}>
              <Route path="" element={<Main />} />
              <Route path="logout" element={<Logout />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPanel/>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App
