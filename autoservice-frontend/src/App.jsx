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
import Register from './pages/Register.jsx';
import UserManagement from './pages/UserManagement.jsx';

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user.role === 'Администратор') {
    return <Navigate to="/users" replace />;
  }

  if (user.role === 'Менеджер') {
    return <Navigate to="/quality" replace />;
  }

  if (user.role === 'Автомеханик') {
    return <Navigate to="/requests" replace />;
  }

  if (user.role === 'Клиент') {
    return <Navigate to="/requests" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <div className="page-wrapper">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['Администратор']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/requests" element={
                <ProtectedRoute allowedRoles={['Администратор', 'Автомеханик', 'Клиент', 'Менеджер']}>
                  <Requests />
                </ProtectedRoute>
              } />

              <Route path="/create-request" element={
                <ProtectedRoute allowedRoles={['Клиент']}>
                  <CreateRequest />
                </ProtectedRoute>
              } />

              <Route path="/request/:id" element={
                <ProtectedRoute allowedRoles={['Администратор', 'Автомеханик', 'Клиент', 'Менеджер']}>
                  <RequestDetails />
                </ProtectedRoute>
              } />

              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['Администратор']}>
                  <Reports />
                </ProtectedRoute>
              } />

              <Route path="/quality" element={
                <ProtectedRoute allowedRoles={['Администратор', 'Менеджер']}>
                  <QualityDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
