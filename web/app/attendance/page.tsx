'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, CheckCircle, XCircle, Coffee, FileText, ArrowRight, User } from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

export default function AttendancePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const menuItems = getMenuItems(user?.role);

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>({ status: 'not_started', data: null });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workLog, setWorkLog] = useState('');
    const [showClockOutModal, setShowClockOutModal] = useState(false);

    // Leaves State
    const [balances, setBalances] = useState<any>(null);
    const [myLeaves, setMyLeaves] = useState<any[]>([]);
    const [leaveForm, setLeaveForm] = useState({ type: 'Sick', start: '', end: '', reason: '' });
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push('/');
        else if (user) {
            // Only fetch personal data if employee_code exists
            if (user.employee_code) {
                fetchInitialData();
            } else {
                setLoading(false); // Admin without employee code, stop loading
            }
            const timer = setInterval(() => setCurrentTime(new Date()), 1000);
            return () => clearInterval(timer);
        }
    }, [user, authLoading, router]);

    const fetchInitialData = async () => {
        try {
            const [statusRes, balanceRes, leavesRes] = await Promise.all([
                fetch('http://localhost:8000/api/attendance/status', { credentials: 'include' }),
                fetch('http://localhost:8000/api/attendance/leave/balance', { credentials: 'include' }),
                fetch('http://localhost:8000/api/attendance/leave/my-requests', { credentials: 'include' })
            ]);

            if (statusRes.ok) setStatus(await statusRes.json());
            if (balanceRes.ok) setBalances(await balanceRes.json());
            if (leavesRes.ok) setMyLeaves(await leavesRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/attendance/clock-in', {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                fetchInitialData(); // Refresh
            } else {
                alert("Failed to clock in");
            }
        } catch (e) {
            alert("Error clocking in");
        }
    };

    const handleClockOut = async () => {
        if (!workLog.trim()) {
            alert("Please enter a summary of your work today.");
            return;
        }

        try {
            const res = await fetch('http://localhost:8000/api/attendance/clock-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ work_log: workLog })
            });

            if (res.ok) {
                setShowClockOutModal(false);
                fetchInitialData();
            } else {
                alert("Failed to clock out");
            }
        } catch (e) {
            alert("Error clocking out");
        }
    };

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/attendance/leave/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    leave_type: leaveForm.type,
                    start_date: leaveForm.start,
                    end_date: leaveForm.end,
                    reason: leaveForm.reason
                })
            });

            if (res.ok) {
                setShowLeaveModal(false);
                setLeaveForm({ type: 'Sick', start: '', end: '', reason: '' });
                fetchInitialData();
            } else {
                const err = await res.json();
                alert(err.detail || "Failed to apply");
            }
        } catch (e) {
            alert("Error applying leave");
        }
    };

    if (loading) return <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
            <Waves lineColor="#230a46ff" backgroundColor="rgba(0,0,0,0.2)" className="fixed inset-0 pointer-events-none z-0" />

            <StaggeredMenu items={menuItems} position="right" isFixed={true} />

            <main className="mx-auto max-w-7xl p-6 pt-32 relative z-10 animate-fade-in-up">
                <h1 className="text-4xl font-bold mb-2">Attendance & Leaves</h1>
                <p className="text-gray-400 mb-8">Track your work hours and manage time off.</p>

                {/* --- MANAGER DASHBOARD (Admin/HR Only) --- */}
                {user && ['Admin', 'HR', 'Management'].includes(user.role) && (
                    <ManagerSection />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">

                    {/* EMPLOYEE SECTION (Only if linked to an employee profile) */}
                    {user?.employee_code ? (
                        <>
                            {/* 1. Clock In/Out Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-[#111]/80 backdrop-blur-xl border border-[#333] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 blur-[50px] rounded-full pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <p className="text-gray-500 text-sm font-mono">{currentTime.toDateString()}</p>
                                            <h2 className="text-3xl font-bold mt-1 font-mono tracking-wider">
                                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </h2>
                                        </div>
                                        <div className="p-3 bg-[#222] rounded-full text-brand-purple">
                                            <Clock size={24} />
                                        </div>
                                    </div>

                                    {status.status === 'not_started' ? (
                                        <div className="text-center">
                                            <button
                                                onClick={handleClockIn}
                                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform flex flex-col items-center gap-2"
                                            >
                                                <CheckCircle size={32} />
                                                Clock In
                                            </button>
                                            <p className="text-sm text-gray-500 mt-4">Start your workday tracking.</p>
                                        </div>
                                    ) : status.status === 'clocked_in' ? (
                                        <div className="text-center">
                                            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-6">
                                                <p className="text-xs text-gray-500 uppercase">Clocked In At</p>
                                                <p className="text-xl font-bold text-white">{status.data.clock_in}</p>
                                            </div>
                                            <button
                                                onClick={() => setShowClockOutModal(true)}
                                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform flex flex-col items-center gap-2"
                                            >
                                                <XCircle size={32} />
                                                Clock Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                                                <CheckCircle size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Day Completed!</h3>
                                            <p className="text-gray-500 mt-2">You clocked out at {status.data.clock_out}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Leave Balances Quick View */}
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-[#111]/60 border border-[#222] rounded-2xl p-4">
                                        <p className="text-xs text-brand-purple uppercase font-bold">Sick Leave</p>
                                        <p className="text-2xl font-bold text-white mt-1">
                                            {balances ? `${balances.sick_total - balances.sick_used}/${balances.sick_total}` : '-'}
                                        </p>
                                    </div>
                                    <div className="bg-[#111]/60 border border-[#222] rounded-2xl p-4">
                                        <p className="text-xs text-blue-400 uppercase font-bold">Casual Leave</p>
                                        <p className="text-2xl font-bold text-white mt-1">
                                            {balances ? `${balances.casual_total - balances.casual_used}/${balances.casual_total}` : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Main Content (Tabbed or Combined) */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Leave Applications */}
                                <div className="bg-[#111]/60 border border-[#222] rounded-3xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Coffee className="text-brand-purple" /> My Leaves
                                        </h3>
                                        <button
                                            onClick={() => setShowLeaveModal(true)}
                                            className="px-4 py-2 bg-[#222] hover:bg-brand-purple hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                        >
                                            + Apply Leave
                                        </button>
                                    </div>

                                    {myLeaves.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No leave history.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {myLeaves.map((leave, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row justify-between items-center bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${leave.leave_type === 'Sick' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                                            }`}>
                                                            {leave.leave_type[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{leave.leave_type} Leave</p>
                                                            <p className="text-xs text-gray-500">{leave.start_date} to {leave.end_date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                                                                leave.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                                                            }`}>
                                                            {leave.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500 bg-[#111]/40 rounded-3xl border border-[#222]">
                            <p className="text-xl font-bold text-gray-400">Information Panel</p>
                            <p className="mt-2">You are viewing this as an Administrator. Personal attendance tracking is disabled.</p>
                        </div>
                    )}
                </div>

                {/* --- Modals --- */}

                {/* 1. Clock Out Modal (Work Log) */}
                {showClockOutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-2">End of Day Report</h3>
                            <p className="text-gray-500 text-sm mb-4">Please submit a summary of your work before clocking out.</p>

                            <textarea
                                value={workLog}
                                onChange={(e) => setWorkLog(e.target.value)}
                                placeholder="- Implemented X feature&#10;- Fixed Y bug&#10;- Attended Z meeting"
                                className="w-full h-32 bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-white placeholder-gray-600 focus:border-brand-purple outline-none mb-6 resize-none"
                            ></textarea>

                            <div className="flex gap-3">
                                <button onClick={() => setShowClockOutModal(false)} className="flex-1 py-3 bg-[#222] rounded-xl text-gray-400 font-bold">Cancel</button>
                                <button onClick={handleClockOut} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">Clock Out</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Apply Leave Modal */}
                {showLeaveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-6">Apply for Leave</h3>
                            <form onSubmit={handleApplyLeave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500 uppercase">Type</label>
                                        <select
                                            value={leaveForm.type}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                            className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white outline-none"
                                        >
                                            <option value="Sick">Sick Leave</option>
                                            <option value="Casual">Casual Leave</option>
                                            <option value="Privilege">Privilege Leave</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500 uppercase">From</label>
                                        <input type="date" required value={leaveForm.start} onChange={(e) => setLeaveForm({ ...leaveForm, start: e.target.value })} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white outline-none" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500 uppercase">To</label>
                                        <input type="date" required value={leaveForm.end} onChange={(e) => setLeaveForm({ ...leaveForm, end: e.target.value })} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white outline-none" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-500 uppercase">Reason</label>
                                    <textarea required value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white outline-none h-24 resize-none" />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowLeaveModal(false)} className="flex-1 py-3 bg-[#222] rounded-xl text-gray-400 font-bold">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-bold">Submit Application</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

function ManagerSection() {
    const [activeTab, setActiveTab] = useState<'logs' | 'approvals'>('approvals');
    const [logs, setLogs] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsRes, reqsRes] = await Promise.all([
                fetch('http://localhost:8000/api/attendance/admin/today', { credentials: 'include' }),
                fetch('http://localhost:8000/api/attendance/leave/all-requests', { credentials: 'include' })
            ]);
            if (logsRes.ok) setLogs(await logsRes.json());
            if (reqsRes.ok) setRequests(await reqsRes.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApproval = async (id: number, action: 'Approved' | 'Rejected', reason: string = '') => {
        if (!confirm(`Confirm ${action}?`)) return;
        try {
            const formData = new FormData();
            formData.append('action', action);
            if (reason) formData.append('reason', reason);

            const res = await fetch(`http://localhost:8000/api/attendance/leave/action/${id}`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            if (res.ok) fetchData();
            else alert("Action failed");
        } catch (e) { alert("Network error"); }
    };

    return (
        <div className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-3xl p-6 mb-8 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-brand-purple" /> Team Overview
                    </h2>
                    <p className="text-sm text-gray-500">Monitor activity and approve requests.</p>
                </div>
                <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg">
                    <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'approvals' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}>Approvals ({requests.length})</button>
                    <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}>Daily Logs</button>
                </div>
            </div>

            {loading ? <div className="text-center py-8 text-gray-500">Loading team data...</div> : (
                <>
                    {activeTab === 'approvals' && (
                        requests.length === 0 ? <p className="text-center py-8 text-gray-500">No pending leave requests.</p> :
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase border-b border-[#333]">
                                            <th className="p-4">Employee</th>
                                            <th className="p-4">Leave Type</th>
                                            <th className="p-4">Dates</th>
                                            <th className="p-4">Reason</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(req => (
                                            <tr key={req.id} className="border-b border-[#222]/50 hover:bg-[#1a1a1a]">
                                                <td className="p-4 font-bold text-white">{req.employee_name}</td>
                                                <td className="p-4 text-sm"><span className={`px-2 py-1 rounded-md ${req.leave_type === 'Sick' ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'}`}>{req.leave_type}</span></td>
                                                <td className="p-4 text-sm text-gray-300">{req.start_date} to {req.end_date}</td>
                                                <td className="p-4 text-sm text-gray-400 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => handleApproval(req.id, 'Approved')} className="p-2 hover:bg-green-900/20 text-green-400 rounded"><CheckCircle size={18} /></button>
                                                    <button onClick={() => handleApproval(req.id, 'Rejected')} className="p-2 hover:bg-red-900/20 text-red-400 rounded"><XCircle size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                    )}

                    {activeTab === 'logs' && (
                        logs.length === 0 ? <p className="text-center py-8 text-gray-500">No attendance records for today yet.</p> :
                            <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                                {logs.map(log => (
                                    <div key={log.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-white text-lg">{log.employee_name}</p>
                                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={14} /> In: {log.clock_in}</span>
                                                {log.clock_out && <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Out: {log.clock_out}</span>}
                                            </div>
                                        </div>
                                        {log.work_log && (
                                            <div className="flex-1 bg-[#222] p-3 rounded-lg text-sm text-gray-300 border border-[#333]">
                                                <p className="text-xs text-brand-purple uppercase font-bold mb-1">Work Log</p>
                                                <p className="whitespace-pre-wrap">{log.work_log}</p>
                                            </div>
                                        )}
                                        {!log.clock_out && (
                                            <div className="flex items-center">
                                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs rounded-full animate-pulse border border-green-500/20">Working Now</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                    )}
                </>
            )}
        </div>
    );
}
