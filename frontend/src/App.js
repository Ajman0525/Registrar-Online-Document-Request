import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Index from "./pages/Index";
import Landing from "./pages/user/Landing";
import UserMasterLayout from "./pages/layouts/UserMasterLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/user/Landing" element={< Landing />} />
        <Route path="/user" element={<UserMasterLayout />} />
        
        <Route path="/admin/login" element={< AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
