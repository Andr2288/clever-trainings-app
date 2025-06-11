import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Calculator, User } from 'lucide-react';

const Header = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Головна', icon: Home },
        { path: '/workouts', label: 'Тренування', icon: Dumbbell },
        { path: '/calories', label: 'Калорії', icon: Calculator },
        { path: '/profile', label: 'Профіль', icon: User },
    ];

    return (
        <header className="bg-blue-600 shadow-lg">
            <nav className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-white text-2xl font-bold">
                        FitApp
                    </Link>

                    <div className="flex space-x-6">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-white transition-colors ${
                                    location.pathname === path
                                        ? 'bg-blue-700'
                                        : 'hover:bg-blue-500'
                                }`}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;