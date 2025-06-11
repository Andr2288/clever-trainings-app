import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import { Activity, Heart, Target, TrendingUp } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* Left side - Welcome content */}
                <div className="text-center lg:text-left space-y-8">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                            FitApp
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Ваш персональний помічник для здорового способу життя
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Трекінг харчування</h3>
                                <p className="text-gray-600">Відстежуйте калорії та поживні речовини</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Персональні тренування</h3>
                                <p className="text-gray-600">Вправи під ваш рівень підготовки</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Аналітика прогресу</h3>
                                <p className="text-gray-600">Відстежуйте свої досягнення</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-red-100 p-3 rounded-full">
                                <Heart className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Турбота про здоров'я</h3>
                                <p className="text-gray-600">Комплексний підхід до фітнесу</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-2xl shadow-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">1000+</div>
                            <div className="text-sm text-gray-600">Продуктів</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">50+</div>
                            <div className="text-sm text-gray-600">Тренувань</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">24/7</div>
                            <div className="text-sm text-gray-600">Доступ</div>
                        </div>
                    </div>
                </div>

                {/* Right side - Auth forms */}
                <div className="flex justify-center">
                    {isLogin ? (
                        <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
                    ) : (
                        <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;