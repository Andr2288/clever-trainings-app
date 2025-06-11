import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Calculator, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { authUser, logout, getUserName } = useAuthStore();

    const navItems = [
        { path: '/', label: 'Головна', icon: Home },
        { path: '/workouts', label: 'Тренування', icon: Dumbbell },
        { path: '/calories', label: 'Калорії', icon: Calculator },
        { path: '/profile', label: 'Профіль', icon: User },
    ];

    const handleLogout = async () => {
        await logout();
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-white text-2xl font-bold hover:text-blue-100 transition">
                        FitApp
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-white transition-all duration-200 ${
                                    location.pathname === path
                                        ? 'bg-white/20 backdrop-blur-sm'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Info & Actions (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {authUser ? (
                            <div className="flex items-center space-x-3">
                                {/* User greeting */}
                                <div className="text-white text-sm">
                                    <span className="opacity-80">Привіт, </span>
                                    <span className="font-medium">{getUserName()}</span>
                                </div>

                                {/* User avatar */}
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <User size={18} className="text-white" />
                                </div>

                                {/* Logout button */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-md transition"
                                    title="Вийти"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden lg:inline">Вийти</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-white text-sm">
                                Увійдіть для повного доступу
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-md transition"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-white/20">
                        <div className="space-y-2 mt-4">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition ${
                                        location.pathname === path
                                            ? 'bg-white/20'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </Link>
                            ))}

                            {authUser && (
                                <>
                                    <div className="border-t border-white/20 my-2"></div>

                                    {/* User info mobile */}
                                    <div className="px-4 py-2 text-white/80 text-sm">
                                        Користувач: <span className="font-medium text-white">{getUserName()}</span>
                                    </div>

                                    {/* Logout mobile */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition"
                                    >
                                        <LogOut size={20} />
                                        <span>Вийти</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;