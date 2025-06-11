import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { authUser, isCheckingAuth } = useAuthStore();

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader className="size-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Перевірка авторизації...</p>
                </div>
            </div>
        );
    }

    if (!authUser) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;