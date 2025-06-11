import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Calories from './pages/Calories';
import Profile from './pages/Profile';
import Header from './components/Header';

import {useAuthStore} from "./store/useAuthStore.js";
import {useEffect} from "react";

import {Loader} from "lucide-react";

const App = () => {

    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    console.log({authUser});

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        )
    }

    return (
        <div className="app-container">
            {/* Header component with navigation */}
            <Header />

            <div className="main-content">
                {/* Define routes for different pages */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/calories" element={<Calories />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
        </div>
    )
}

export default App