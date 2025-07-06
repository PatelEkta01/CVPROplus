import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Login from "./pages/login";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import ForgotPassword from "./pages/forgot-password";
import ResetPass from "./pages/reset-password"
import Dashboard from "./pages/dashboard";
import Uploadresume from "./pages/uploadresume"
import TemplateSelection from "./pages/template_selection";
import RateMyResume from "./pages/RateMyResume";
import AdminDashboard from "./pages/admindashboard";
import UserResumesPage from "./pages/UserResumesPage";
import Adminlogin from "./pages/adminlogin"


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPass />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createresume" element={<Uploadresume />} />
        <Route path="/template_selection" element={<TemplateSelection />} />
        <Route path="/template-selection/:resumeId" element={<TemplateSelection />} />
        <Route path="/rate-my-resume" element={<RateMyResume />} />
        <Route path="/adminlogin" element={<Adminlogin />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/user/:userId/resumes" element={<UserResumesPage />} /> {/* New route */}
      </Routes>
    </Router>
  );
};
export default App;