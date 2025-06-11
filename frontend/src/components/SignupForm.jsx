import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const SignupForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const { signup, isSigningUp } = useAuthStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error('Будь ласка, введіть ваше повне ім\'я');
            return false;
        }
        if (!formData.email) {
            toast.error('Будь ласка, введіть email адресу');
            return false;
        }
        if (!formData.password) {
            toast.error('Будь ласка, введіть пароль');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Пароль повинен містити мінімум 6 символів');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await signup(formData);
            toast.success('Реєстрація успішна! Ласкаво просимо!');
        } catch (error) {
            toast.error('Помилка реєстрації. Спробуйте ще раз.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Реєстрація</h2>
                    <p className="text-gray-600">Створіть новий обліковий запис</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Повне ім'я
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="Іван Іванов"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email адреса
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Пароль
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="Мінімум 6 символів"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Пароль повинен містити мінімум 6 символів
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSigningUp}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                    >
                        {isSigningUp ? (
                            <>
                                <Loader className="animate-spin h-5 w-5" />
                                <span>Реєстрація...</span>
                            </>
                        ) : (
                            <span>Зареєструватися</span>
                        )}
                    </button>
                </form>

                {/* Switch to Login */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Вже маєте обліковий запис?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-blue-600 hover:text-blue-800 font-medium transition duration-200"
                        >
                            Увійти
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;