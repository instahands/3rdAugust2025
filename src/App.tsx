// src/App.tsx (UPDATED WITH WORKER ROUTE)

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your page and layout components
import LandingPage from "./app/pages/LandingPage"; // Assuming this exists
import MainApp from "./MainApp"; 
import { AdminPanel } from "./admin/AdminPanel"; 

// 1. Import the WorkerDashboard component
import { WorkerDashboard } from "./worker/WorkerDashboard";

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

        {/* 2. Add the new route for the worker dashboard */}
        <Route path="/worker/*" element={<WorkerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;