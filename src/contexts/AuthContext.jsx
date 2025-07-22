// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { authApi } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        isLoading: true // Add loading state
    });

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('access_token');

            if (token) {
                try {
                    // Verify token is not expired
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        throw new Error("Token expired");
                    }

                    setAuthState({
                        token,
                        user: decoded,
                        isLoading: false
                    });
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setAuthState({
                        token: null,
                        user: null,
                        isLoading: false
                    });
                }
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authApi.login(credentials);
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const user = jwtDecode(access);
            setAuthState({ token: access, user, isLoading: false });

            return { success: true };
        } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            return {
                success: false,
                error: error.response?.data?.detail ||
                    error.response?.data?.error ||
                    'Invalid credentials'
            };
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                await authApi.logout({ refresh: refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setAuthState({ token: null, user: null, isLoading: false });
        }
    };


    const value = {
        ...authState,
        isAuthenticated: !!authState.token,
        isAdmin: authState.user?.is_staff || false,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!authState.isLoading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);