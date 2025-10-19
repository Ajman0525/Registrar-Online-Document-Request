import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import Index from "./pages/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Index />} />
        <Route path="/admin/login" element={< AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
