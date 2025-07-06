import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import LegalGuide from './pages/LegalGuide'
import PoliceDashboard from './pages/PoliceDashboard'
import VictimDashboard from './pages/VictimDashboard'
import FindPoliceStation from './pages/FindPoliceStation'
import './App.css'

// Protected Route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/legal-guide" element={<LegalGuide />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/find-police-station" element={<FindPoliceStation />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/police"
            element={
              <ProtectedRoute allowedRoles={['police']}>
                <PoliceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/victim"
            element={
              <ProtectedRoute allowedRoles={['victim']}>
                <VictimDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
