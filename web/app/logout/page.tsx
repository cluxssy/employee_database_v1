'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LogoutPage() {
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        logout();
    }, [logout]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-pulse">Logging out...</div>
        </div>
    );
}
