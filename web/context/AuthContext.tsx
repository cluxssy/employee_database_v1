'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
    id: number;
    username: string;
    role: 'Admin' | 'HR' | 'Management' | 'Employee';
    employee_code?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            // First check memory/context (handled by state)
            // Then check API (for page reloads)
            const res = await fetch('/api/auth/check', { credentials: 'include' });
            const data = await res.json();

            if (data.authenticated && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
                // If backend says session is invalid, clear the middleware cookie to prevent redirect loops
                Cookies.remove('auth_token');
                sessionStorage.removeItem('user');
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            setUser(null);
            Cookies.remove('auth_token');
            sessionStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        // We can also store in sessionStorage as a backup if we want pure client-side persistence without waiting for API
        sessionStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.error("Logout error", e);
        }
        Cookies.remove('auth_token'); // Clear middleware protection cookie
        setUser(null);
        sessionStorage.removeItem('user');
        window.location.href = '/'; // Hard refresh to ensure everything is cleared
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
