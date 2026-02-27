import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.role) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/requests" replace />;
    }

    return children;
}

export default ProtectedRoute;