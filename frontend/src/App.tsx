import { useState, useEffect } from 'react'
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
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check token validity on app start and auth changes
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setIsAuthenticated(true);
        console.log("Auth state updated: User authenticated as", user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserRole(null);
        console.log("Auth state cleared due to error");
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      console.log("No authentication data found");
    }
    
    setIsInitializing(false);
  };

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log("Auth change detected");
      checkAuth();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange); // For changes from other tabs
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Define protected route component
  const ProtectedRoute = ({ children, role }: { children: JSX.Element, role?: string }) => {
    console.log("Rendering protected route, auth:", isAuthenticated, "role:", userRole, "required:", role);
    
    if (isInitializing) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      console.log("Access denied: Not authenticated");
      return <Navigate to="/login" replace />;
    }
    
    if (role && userRole !== role) {
      console.log(`Access denied: Role mismatch (needed ${role}, has ${userRole})`);
      return <Navigate to={`/dashboard/${userRole}`} replace />;
    }
    
    return children;
  };

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
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
              <ProtectedRoute role="police">
                <PoliceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/victim"
            element={
              <ProtectedRoute role="victim">
                <VictimDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
