import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pumps from './pages/Pumps';
import NewSale from './pages/NewSale';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales/new" element={<NewSale />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="inventory" element={<Pumps />} />
            
            {/* Admin Only Routes */}
            <Route path="reports" element={
              <ProtectedRoute requireAdmin={true}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute requireAdmin={true}>
                <Settings />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
