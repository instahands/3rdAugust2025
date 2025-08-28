// src/App.tsx (CORRECTED)

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your page and layout components
import LandingPage from "./app/pages/LandingPage.tsx";
import MainApp from "./MainApp"; 
// CORRECTED: The import path now correctly points to the admin folder inside src
import AdminPanel from "./admin/AdminPanel.tsx"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={<LandingPage />} />

        {/* Main app route */}
        <Route path="/app/*" element={<MainApp />} />

        {/* Admin panel route */}
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
