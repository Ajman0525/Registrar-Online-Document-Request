import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Index from "./pages/Index";
import Landing from "./pages/user/Landing";
import UserMasterLayout from "./pages/layouts/UserMasterLayout";
import RegistrarMasterLayout from "./pages/layouts/RegistrarMasterLayout";

const PlaceholderDocument = () => (
    <div>
      <h1>Document Management</h1>
      <p>Placeholder component</p>
    </div>
);

const PlaceholderLogs = () => (
    <div>
      <h1>Activity Logs</h1>
      <p>Placeholder component</p>
    </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/user/Landing" element={< Landing />} />
        <Route path="/user" element={<UserMasterLayout />} />
        
        <Route path="/admin/login" element={< AdminLogin />} />
        <Route path="/admin" element={<RegistrarMasterLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path = "/admin/document" element = {<PlaceholderDocument />} />
          <Route path = "/admin/logs" element = {<PlaceholderLogs />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
