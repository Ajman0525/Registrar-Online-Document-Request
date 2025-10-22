import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";

import Index from "./pages/Index";
import Landing from "./pages/user/Landing";
import UserMasterLayout from "./pages/layouts/UserMasterLayout";
import UserLogin from "./pages/user/UserLogin";
import Tracking from "./pages/user/Tracking";
import DocumentList from "./pages/user/DocumentList";
import Request from "./pages/user/Request";
import RegistrarMasterLayout from "./pages/layouts/RegistrarMasterLayout";
import Dashboard from "./pages/admin/Dashboard";
import Documents from "./pages/admin/Documents";
import Requests from "./pages/admin/Requests";
import Logs from "./pages/admin/Logs";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/user/Landing" element={< Landing />} />

        <Route path="/user" element={<UserMasterLayout />}>
          <Route path="UserLogin" element={< UserLogin />}/>
          <Route path="Request" element={< Request />} />
          <Route path="View" element={< DocumentList />} />
          <Route path="Track" element={< Tracking />} />
        </Route>
        
        <Route path="/admin/login" element={< AdminLogin />} />
        <Route path="/admin" element={<RegistrarMasterLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/requests" element={<Requests />} />
          <Route path = "/admin/document" element = {<Documents />} />
          <Route path = "/admin/logs" element = {<Logs />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
