import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';                    // Добавлено .jsx
import Requests from './pages/Requests.jsx';              // Добавлено .jsx
import CreateRequest from './pages/CreateRequest.jsx';    // Добавлено .jsx
import RequestDetails from './pages/RequestDetails.jsx';  // Добавлено .jsx
import Reports from './pages/Reports.jsx';                // Добавлено .jsx
import QualityDashboard from './pages/QualityDashboard.jsx'; // Добавлено .jsx
import Navbar from './components/Navbar.jsx';             // Добавлено .jsx
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Добавлено .jsx
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/requests" replace />} />

          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['Администратор', 'Автомеханик', 'Клиент']}>
              <Requests />
            </ProtectedRoute>
          } />

          <Route path="/create-request" element={
            <ProtectedRoute allowedRoles={['Клиент']}>
              <CreateRequest />
            </ProtectedRoute>
          } />

          <Route path="/request/:id" element={
            <ProtectedRoute allowedRoles={['Администратор', 'Автомеханик', 'Клиент']}>
              <RequestDetails />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['Администратор']}>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/quality" element={
            <ProtectedRoute allowedRoles={['Администратор']}>
              <QualityDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;