import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import AdminDashboard from "./pages/AdminDashboard";
import RequestDetail from "./pages/RequestDetail";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Layout>
          <Home />
          <Login/>
          <LandingPage />
        </Layout>

        <Routes>
          <Route path = '/' element = {<LandingPage/>}/>
          <Route path = '/home' element = {<Home/>}/>
          <Route path = '/login' element = {<Login/>}/>
          <Route path = '/dashboard' element = {<Dashboard/>}/>
          <Route path = '/new-request' element = {<NewRequest/>}/>
          <Route path = '/admin' element = {<AdminDashboard/>}/>
          <Route path="/requests/:id" element={<RequestDetail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
