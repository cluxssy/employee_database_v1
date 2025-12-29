'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserPlus, Trash2, List, FileText, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

interface SystemUser {
    id: number;
    username: string;
    role: string;
}

interface AuditLog {
    id: number;
    username: string | null;
    action: string;
    details: string | null;
    timestamp: string;
}

export default function AdminPanel() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

    // Auth Check
    const isAuthorized = user && user.role === 'Admin';
    useEffect(() => {
        if (!authLoading && !isAuthorized) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthorized, user, router]);

    // Data State
    const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Management' });

    // Menu
    const menuItems = user ? getMenuItems(user.role) : [];

    // Fetch Data
    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/admin/users', { credentials: 'include' });
            if (res.ok) setSystemUsers(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/admin/logs', { credentials: 'include' });
            if (res.ok) setLogs(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (isAuthorized) {
            if (activeTab === 'users') fetchUsers();
            else fetchLogs();
        }
    }, [isAuthorized, activeTab]);

    // Handlers
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            setMessage({ type: 'error', text: 'Username and password required' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newUser)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'User created successfully!' });
                setNewUser({ username: '', password: '', role: 'Management' });
                fetchUsers();
            } else {
                setMessage({ type: 'error', text: data.detail || 'Failed to create user' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: number, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) return;

        try {
            const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'User deleted successfully' });
                fetchUsers();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to delete' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Delete failed' });
        }
    };

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
            <Waves lineColor="#230a46ff" backgroundColor="rgba(0,0,0,0.2)" className="fixed inset-0 pointer-events-none z-0" />
            <StaggeredMenu
                position="right"
                isFixed={true}
                items={menuItems}
                displayItemNumbering={true}
                menuButtonColor="#fff"
                openMenuButtonColor="#fff"
                changeMenuColorOnOpen={true}
                colors={['#B19EEF', '#5227FF']}
                logoUrl="/logo.png"
                accentColor="var(--color-brand-purple)"
                menuBackgroundColor="#000000ff"
                itemTextColor="#ffffff"
                smartHeader={true}
                headerColor="#000000ff"
            />

            <main className="relative z-10 max-w-6xl mx-auto p-6 pt-32 animate-fade-in-up">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-3">
                            <Shield className="text-red-500" size={32} /> Admin Administration
                        </h1>
                        <p className="text-gray-400 mt-1">Manage system access, roles, and audit logs.</p>
                    </div>

                    <div className="flex bg-[#222] p-1 rounded-full border border-[#333]">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <UserPlus size={16} /> Users
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Activity size={16} /> Audit Logs
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-red-900/30 text-red-300 border border-red-800'}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto hover:underline text-xs">Dismiss</button>
                    </div>
                )}

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* User List */}
                        <div className="lg:col-span-8 bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <List size={20} className="text-red-400" /> System Users
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#333] text-gray-500 text-xs uppercase">
                                            <th className="pb-3 pl-4">Username</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3 text-right pr-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {systemUsers.map(u => (
                                            <tr key={u.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                                                <td className="py-4 pl-4 font-bold text-white">{u.username}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-red-900/30 text-red-400' :
                                                            u.role === 'HR' ? 'bg-purple-900/30 text-purple-400' :
                                                                'bg-blue-900/30 text-blue-400'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right pr-4">
                                                    {u.username !== user?.username && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.username)}
                                                            className="text-gray-500 hover:text-red-500 transition-colors p-2"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Create User Form */}
                        <div className="lg:col-span-4 bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6 h-fit sticky top-32">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <UserPlus size={20} className="text-red-400" /> Add New User
                            </h2>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Username</label>
                                    <input
                                        type="text"
                                        placeholder="jdoe"
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-red-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-red-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-red-500 outline-none"
                                    >
                                        <option value="Management">Management (Read Only)</option>
                                        <option value="HR">HR (Full Access)</option>
                                        <option value="Admin">Admin (System Access)</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-opacity-90 transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Creating...' : 'Create User'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- LOGS TAB --- */}
                {activeTab === 'logs' && (
                    <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-red-400" /> System Audit Logs
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#333] text-gray-500 text-xs uppercase">
                                        <th className="pb-3 pl-4">Time</th>
                                        <th className="pb-3">User</th>
                                        <th className="pb-3">Action</th>
                                        <th className="pb-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-mono text-gray-400">
                                    {logs.map(log => (
                                        <tr key={log.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                                            <td className="py-3 pl-4 text-xs">{new Date(log.timestamp + 'Z').toLocaleString()}</td>
                                            <td className="py-3 font-bold text-white">{log.username || 'System'}</td>
                                            <td className="py-3 text-red-300">{log.action}</td>
                                            <td className="py-3">{log.details}</td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center italic text-gray-600">No logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
