import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Lock, User } from 'lucide-react';
import { showToast } from '../components/toast/toast';
import InputField from '../components/ui/InputField';

// Constants for repeated styles
const CONTAINER_STYLES = 'min-h-screen bg-gradient-to-br from-gray-600 via-gray-200 to-gray-600 flex items-center justify-center p-4';
const CARD_STYLES = 'bg-white rounded-2xl shadow-xl border border-gray-100 p-8';
const BUTTON_STYLES = 'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 transform';
const BUTTON_ENABLED = 'bg-red-600 hover:bg-red-700 hover:shadow-lg';
const BUTTON_DISABLED = 'bg-gray-400 cursor-not-allowed';

// Simple input sanitization
const sanitizeInput = (input) => {
    return input.replace(/[<>"';&]/g, '').trim();
};

// Basic rate-limiting state
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes in ms

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const sanitizedValue = sanitizeInput(value);
        setCredentials((prev) => ({ ...prev, [name]: sanitizedValue }));
    }, []);

    const validateInputs = () => {
        if (!credentials.username || !credentials.password) {
            showToast.error('Username and password are required');
            return false;
        }
        if (credentials.username.length > 50 || credentials.password.length > 50) {
            showToast.error('Input length exceeds maximum limit');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting || (lockoutUntil && Date.now() < lockoutUntil)) {
            if (lockoutUntil) {
                const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
                showToast.error(`Too many attempts. Try again in ${remaining} seconds`);
            }
            return;
        }

        if (!validateInputs()) return;

        setIsSubmitting(true);
        const toastId = showToast.loading('Signing in...');

        try {
            const result = await login(credentials);

            if (result.success) {
                showToast.success('Login successful! Redirecting...', toastId);
                setAttempts(0); // Reset attempts on success
                navigate('/');
            } else {
                setAttempts((prev) => prev + 1);
                if (attempts + 1 >= MAX_ATTEMPTS) {
                    setLockoutUntil(Date.now() + LOCKOUT_TIME);
                    showToast.error('Too many failed attempts. Account locked for 5 minutes', toastId);
                } else {
                    showToast.error(result.error || 'Invalid credentials', toastId);
                }
            }
        } catch (error) {
            setAttempts((prev) => prev + 1);
            if (attempts + 1 >= MAX_ATTEMPTS) {
                setLockoutUntil(Date.now() + LOCKOUT_TIME);
                showToast.error('Too many failed attempts. Account locked for 5 minutes', toastId);
            } else {
                showToast.error(error.message || 'Login failed', toastId);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={CONTAINER_STYLES}>
            <div className="relative w-full max-w-md">
                <div className={CARD_STYLES}>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-800 ">SBD-Syst</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            name="username"
                            type="text"
                            icon={User}
                            placeholder="Enter your username"
                            autoComplete="username"
                            value={credentials.username}
                            onChange={handleChange}
                            disabled={isSubmitting || (lockoutUntil && Date.now() < lockoutUntil)}
                            label="Username"
                            required
                        />

                        <InputField
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            icon={Lock}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={handleChange}
                            disabled={isSubmitting || (lockoutUntil && Date.now() < lockoutUntil)}
                            showPassword={showPassword}
                            togglePassword={() => setShowPassword(!showPassword)}
                            label="Password"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting || (lockoutUntil && Date.now() < lockoutUntil)}
                            className={`${BUTTON_STYLES} ${isSubmitting || (lockoutUntil && Date.now() < lockoutUntil) ? BUTTON_DISABLED : BUTTON_ENABLED
                                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            For more information, visit{' '}
                            <a
                                href="https://hashtagrig.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-red-600 hover:text-red-800 transition-colors"
                            >
                                Royal Irons Gym
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;