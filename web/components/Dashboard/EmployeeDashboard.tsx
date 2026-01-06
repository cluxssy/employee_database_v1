import { useState, useEffect } from 'react';
import { Target, BookOpen, Laptop, Bell, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard({ user }: { user: any }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/dashboard/employee-stats', { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setStats(json);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;
    if (loading) return <div className="text-center text-gray-500 py-12">Loading dashboard...</div>;

    const kras = stats?.kras || { total: 0, completed: 0 };
    const training = stats?.training || { total: 0, completed: 0 };
    const assets = stats?.assets || { total: 0 };
    const notifications = stats?.notifications || [];

    // Calculate completion percentages
    const kraPercent = kras.total > 0 ? Math.round((kras.completed / kras.total) * 100) : 0;
    const trainingPercent = training.total > 0 ? Math.round((training.completed / training.total) * 100) : 0;

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">
                        Hello, <span className="text-brand-purple">{user.username}</span>
                    </h1>
                    <p className="text-gray-400">
                        {stats?.employee?.designation ? `${stats.employee.designation} • ` : ''}
                        {stats?.employee?.team || 'Team Member'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/employee-profile/${user.employee_code}`} className="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-white font-medium transition-colors">
                        View Profile
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Performance / KRAs */}
                <div className="bg-[#111] border border-[#222] p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Target size={24} />
                                </div>
                                <span className="text-2xl font-bold">{kraPercent}%</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">Performance</h3>
                            <p className="text-sm text-gray-400">
                                {kras.completed} / {kras.total} KRAs Completed
                            </p>
                        </div>
                        <div className="mt-6">
                            <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${kraPercent}%` }}></div>
                            </div>
                            <Link href="/my-performance" className="mt-4 inline-flex items-center text-sm text-blue-400 hover:text-blue-300 font-medium">
                                View Details <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Training */}
                <div className="bg-[#111] border border-[#222] p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <BookOpen size={24} />
                                </div>
                                <span className="text-2xl font-bold">{trainingPercent}%</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">Training</h3>
                            <p className="text-sm text-gray-400">
                                {training.completed} / {training.total} Modules Completed
                            </p>
                        </div>
                        <div className="mt-6">
                            <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${trainingPercent}%` }}></div>
                            </div>
                            <Link href="/training" className="mt-4 inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-medium">
                                Go to Learning <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Assets */}
                <div className="bg-[#111] border border-[#222] p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Laptop size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                                    <Laptop size={24} />
                                </div>
                                <span className="text-2xl font-bold">{assets.total}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">Assets</h3>
                            <p className="text-sm text-gray-400">Devices assigned to you</p>
                        </div>
                        <div className="mt-6">
                            <Link href="/manage-assets" className="inline-flex items-center text-sm text-green-400 hover:text-green-300 font-medium">
                                View Inventory <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications / Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111] border border-[#222] rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Bell size={20} className="text-brand-purple" />
                        Latest Notifications
                    </h3>
                    <div className="space-y-4">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No new notifications at the moment.
                            </div>
                        ) : (
                            notifications.map((notif: any, i: number) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#222] transition-colors border border-[#222]">
                                    <div className="mt-1">
                                        {notif.type === 'Alert' ? (
                                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">{notif.title}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                                        <span className="text-xs text-gray-600 mt-2 block">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions or Other Info */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#222] rounded-3xl p-8 flex flex-col justify-center items-start">
                    <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
                    <p className="text-gray-400 mb-6">
                        Contact HR for any queries regarding your employment, leaves, or assets.
                    </p>
                    <div className="space-y-3 w-full">
                        <button className="w-full py-3 px-4 bg-[#222] hover:bg-[#333] rounded-xl text-left flex items-center gap-3 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                                ?
                            </div>
                            <span className="font-medium">Raise a Ticket</span>
                        </button>
                        <button className="w-full py-3 px-4 bg-[#222] hover:bg-[#333] rounded-xl text-left flex items-center gap-3 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                                @
                            </div>
                            <span className="font-medium">Contact HR Support</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
