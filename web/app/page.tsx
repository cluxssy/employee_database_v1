'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import DarkVeil from '../components/Background/DarkVeil';
import DecryptedText from '../components/Text Animation/DecryptedText';




export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Simple session storage for now (replace with contexts/cookies later)
        sessionStorage.setItem('user', JSON.stringify(data));
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Connection refused. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main Container: Centers everything vertically and horizontally on the screen
    <div className="relative flex min-h-screen items-center justify-center bg-brand-black overflow-hidden">

      {/* Background Animation */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
          <DarkVeil />
        </div>
      </div>

      {/* Login Card: The main white/dark box holding the form */}
      <div className="relative z-12 w-150 max-w-lg rounded-xl bg-card-bg/90 backdrop-blur-sm border border-border-color p-8 shadow-2xl">

        {/* Header Section: Icon + Title */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-black border-2 border-brand-purple">
            <img src="/icon.jpeg" alt="Brand Logo" className="h-10 w-10 object-contain" />
          </div>
          <div style={{ marginTop: '4rem', fontFamily: 'BBH Bartle', fontSize: '2rem' }}>
            <DecryptedText
              text="Lets Log you in....."
              animateOn="view"
              revealDirection="start"
              speed={80}
              maxIterations={15}
            // useOriginalCharsOnly={true}
            />
          </div>
        </div>

        {/* Error Alert: Shows up only if login fails */}
        {error && (
          <div className="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200 border border-red-800">
            {error}
          </div>
        )}

        {/* The Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username Field */}
          <div>
            <label className="text-sm font-medium text-gray-300">Username</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-border-color bg-input-bg py-2 pl-10 pr-4 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple text-white placeholder-gray-500"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-color bg-input-bg py-2 pl-10 pr-4 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple text-white placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-brand-purple py-3 font-bold text-white uppercase transition hover:bg-transparent hover:text-brand-purple border-2 border-brand-purple disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Text */}
        <div className="mt-6 text-center text-xs text-gray-400">
          EwandzDigital HRMS &copy; 2025
        </div>
      </div>
    </div>
  );
}
