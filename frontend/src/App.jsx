import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Loader } from "lucide-react";

import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Calories from './pages/Calories';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import Header from './components/Header';

import { useAuthStore } from "./store/useAuthStore.js";

const App = () => {
    const {
        authUser,
        checkAuth,
        isCheckingAuth,
        initialize
    } = useAuthStore();

    const [isInitialized, setIsInitialized] = useState(false);

    // Ініціалізація додатку
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Ініціалізуємо auth store (перевіряє авторизацію)
                await initialize();
            } catch (error) {
                console.error('Помилка ініціалізації додатку:', error);
            } finally {
                setIsInitialized(true);
            }
        };

        initializeApp();
    }, [initialize]);

    // Показуємо загрузку під час ініціалізації
    if (!isInitialized || isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Loader className="size-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Завантаження додатку...</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {isCheckingAuth ? 'Перевірка авторизації...' : 'Ініціалізація...'}
                    </p>
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
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#4ade80',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </>
        );
    }

    // Якщо користувач авторизований, показуємо основний додаток
    return (
        <div className="app-container min-h-screen bg-gray-50">
            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
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

            {/* Global error boundary could be added here */}
        </div>
    );
};

export default App;