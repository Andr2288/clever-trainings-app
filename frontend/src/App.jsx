import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Calories from './pages/Calories';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import Header from './components/Header';

import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";

import { Loader } from "lucide-react";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    console.log({ authUser });

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader className="size-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Завантаження...</p>
                </div>
            </div>
        );
    }

    // Якщо користувач не авторизований, показуємо сторінку входу
    if (!authUser) {
        return (
            <>
                <AuthPage />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
            </>
        );
    }

    // Якщо користувач авторизований, показуємо основний додаток
    return (
        <div className="app-container">
            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />

            {/* Header component with navigation */}
            <Header />

            <div className="main-content">
                {/* Define routes for different pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/calories" element={<Calories />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* Redirect to home for any unknown routes */}
                    <Route path="*" element={<Home />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;