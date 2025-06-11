import './App.css';
import './pages/styles/style-user.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParkingManagement from './pages/ParkingManagement';
import VehicleManagement from './pages/History';
import UserManagement from './pages/UserManagement';
import Payment from './pages/Payment';
import Reports from './pages/Reports';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

// Create a separate component for the layout with authenticated user
const AuthenticatedLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        {/* User profile header */}
        <div className="user-profile-header">
          <div className="user-welcome">
            <span>Welcome, </span>
            <span className="user-name">{user?.fullName || user?.username || 'Admin'}</span>
          </div>
        </div>
        <Routes>
          <Route path="parking-management" element={<ParkingManagement />} />
          <Route path="history" element={<VehicleManagement />} />
          <Route path="user-management" element={
            <ProtectedRoute requiredRole="Admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="payment" element={<Payment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/parking-management" />} />
          <Route path="*" element={<Navigate to="/parking-management" />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with navbar */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;