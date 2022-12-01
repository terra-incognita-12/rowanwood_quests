import "bootstrap/dist/css/bootstrap.min.css"
import { Routes, Route } from "react-router-dom"

import Layout from "./components/Layout"

import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Logout from "./components/auth/Logout"
import RequireAuth from "./components/auth/RequireAuth"
import PersistLogin from "./components/auth/PersistLogin"

import Home from "./components/pages/Home"
import Library from "./components/pages/Library"
import About from "./components/pages/About"
import QuestDetails from "./components/pages/QuestDetails"
import Profile from "./components/pages/Profile"
import Admin from "./components/pages/Admin"

import Editor from "./components/pages/editor/Editor"
import CreateQuest from "./components/pages/editor/CreateQuest"
import EditQuestsList from "./components/pages/editor/EditQuestsList"
import EditQuest from "./components/pages/editor/EditQuest"
import DeleteQuest from "./components/pages/editor/DeleteQuest"

import ForgetPass from "./components/pages/recoverPass/ForgetPass"
import ChangePass from "./components/pages/recoverPass/ChangePass"

import Unauthorized from "./components/pages/Unauthorized"
 
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
            
          <Route path="register" element={<Register />} />
          <Route path="forgetpass" element={<ForgetPass />} />

          <Route path="login" element={<Login />} />
          <Route exact path="changepass/:token" element={<ChangePass />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          
          <Route element={<PersistLogin />}>
            <Route path="" element={<Home />} />
            <Route path="library" element={<Library />} />
            <Route path="about" element={<About />} />

            <Route exact path="quest/:url" element={<QuestDetails />} />
            
            <Route element={<RequireAuth allowedRoles={['user', 'admin', 'editor']} />}>
              <Route path="profile" element={<Profile />} />
              <Route path="logout" element={<Logout />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={['admin', 'editor']} />}>
              <Route path="editor" element={<Editor />} />
              <Route exact path="editor/quest/create" element={<CreateQuest />} />
              <Route exact path="editor/quest/edit" element={<EditQuestsList />} />
              <Route exact path="editor/quest/edit/:url" element={<EditQuest />} />
              <Route exact path="editor/quest/delete/:url" element={<DeleteQuest />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={['admin']} />}>
              <Route path="admin" element={<Admin/>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App
