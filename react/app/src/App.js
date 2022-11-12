import "bootstrap/dist/css/bootstrap.min.css"
import { Routes, Route } from "react-router-dom"

import Login from "./components/Auth/Login"
import Main from "./components/Pages/Main"
import Layout from "./components/Layout"
 
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="" element={<Main />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </>
  );
}

export default App
