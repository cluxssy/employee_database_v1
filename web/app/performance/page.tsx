'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Target, Users, Briefcase, Plus, Save, Trash2, CheckCircle,
    LayoutDashboard, User, Settings, Layers, Trophy, X
} from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

// --- Interfaces ---
interface KRA {
    id: number;
    name: string;
    goal_name?: string;
    description?: string;
    weightage?: number;
}

interface Group {
    id: number;
    group_name: string;
    description?: string;
    member_count?: number;
}

interface Employee {
    employee_code: string;
    name: string;
    team: string;
    designation?: string;
}

export default function PerformanceManagement() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Auth Check
    const isAuthorized = user && ['Admin', 'HR'].includes(user.role);

    useEffect(() => {
        if (!authLoading && !isAuthorized) {
            if (!user) router.push('/');
            else router.push('/dashboard');
        }
    }, [authLoading, isAuthorized, user, router]);

    // Menu logic
    const menuItems = user ? getMenuItems(user.role) : [];
    const [activeTab, setActiveTab] = useState<'library' | 'groups' | 'assign'>('library');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data State
    const [kras, setKras] = useState<KRA[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Form States
    const [newKRA, setNewKRA] = useState({ name: '', goal_name: '', description: '', weightage: '' });
    const [newGroup, setNewGroup] = useState({ group_name: '', description: '', employee_codes: [] as string[] });
    const [assignment, setAssignment] = useState({
        target_type: 'individual' as 'individual' | 'group' | 'team',
        target_value: '',
        kra_ids: [] as number[],
        period: 'Q1 2025'
    });

    // Group Dialog State
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupMembers, setGroupMembers] = useState<Employee[]>([]);
    const [showGroupDialog, setShowGroupDialog] = useState(false);
    const [membersToAdd, setMembersToAdd] = useState<string[]>([]);
    const [membersToRemove, setMembersToRemove] = useState<string[]>([]);

    // Search States
    const [searchGroupMembers, setSearchGroupMembers] = useState('');
    const [searchAssignEmployees, setSearchAssignEmployees] = useState('');

    // Protected Content




    const fetchInitialData = async () => {
        try {
            const [kRes, gRes, tRes, eRes] = await Promise.all([
                fetch('http://localhost:8000/api/performance/kras', { credentials: 'include' }),
                fetch('http://localhost:8000/api/performance/groups', { credentials: 'include' }),
                fetch('http://localhost:8000/api/performance/teams', { credentials: 'include' }),
                fetch('http://localhost:8000/api/employees', { credentials: 'include' })
            ]);

            if (kRes.ok) setKras(await kRes.json());
            if (gRes.ok) setGroups(await gRes.json());
            if (tRes.ok) setTeams(await tRes.json());
            if (eRes.ok) setEmployees(await eRes.json());

        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // --- Handlers ---

    const handleCreateKRA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/performance/kras', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newKRA)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'KRA Created successfully!' });
                setNewKRA({ name: '', goal_name: '', description: '', weightage: '' });
                fetchInitialData();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to create KRA' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKRA = async (kraId: number) => {
        if (!confirm('Are you sure you want to delete this KRA? This will also remove all assignments.')) {
            return;
        }
        try {
            const res = await fetch(`http://localhost:8000/api/performance/kras/${kraId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'KRA deleted successfully!' });
                fetchInitialData();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete KRA' });
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/performance/groups', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGroup)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Group Created successfully!' });
                setNewGroup({ group_name: '', description: '', employee_codes: [] });
                fetchInitialData();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to create group' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGroupDialog = async (group: Group) => {
        setSelectedGroup(group);
        setShowGroupDialog(true);
        setMembersToAdd([]);
        setMembersToRemove([]);

        try {
            const res = await fetch(`http://localhost:8000/api/performance/groups/${group.id}/members`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setGroupMembers(data.members || []);
            }
        } catch (err) {
            console.error('Failed to load group members', err);
        }
    };

    const handleUpdateGroupMembers = async () => {
        if (!selectedGroup) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/performance/groups/${selectedGroup.id}/members`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ add: membersToAdd, remove: membersToRemove })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Group members updated!' });
                setShowGroupDialog(false);
                fetchInitialData();
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update members' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;

        if (!confirm(`Are you sure you want to delete the group "${selectedGroup.group_name}"? This will remove all member associations.`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/performance/groups/${selectedGroup.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Group deleted successfully!' });
                setShowGroupDialog(false);
                fetchInitialData();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete group' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete group' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (assignment.kra_ids.length === 0 || !assignment.target_value) {
            alert("Please select at least one KRA and a target.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/performance/assign', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignment)
            });
            const result = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: result.message });
                setAssignment({ ...assignment, kra_ids: [], target_value: '' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Assignment failed' });
        } finally {
            setLoading(false);
        }
    };

    const toggleKRASelection = (id: number) => {
        setAssignment(prev => {
            const exists = prev.kra_ids.includes(id);
            return {
                ...prev,
                kra_ids: exists ? prev.kra_ids.filter(k => k !== id) : [...prev.kra_ids, id]
            };
        });
    };

    const toggleGroupMember = (code: string) => {
        setNewGroup(prev => {
            const exists = prev.employee_codes.includes(code);
            return {
                ...prev,
                employee_codes: exists ? prev.employee_codes.filter(c => c !== code) : [...prev.employee_codes, code]
            };
        });
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

            <main className="relative z-10 max-w-7xl mx-auto p-6 pt-32">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                            <Trophy className="text-brand-purple" size={32} /> Performance Management
                        </h1>
                        <p className="text-gray-400 mt-1">Manage KRAs, Reviews, and Employee Goals.</p>
                    </div>

                    <div className="flex bg-[#222] p-1 rounded-full border border-[#333]">
                        {[
                            { id: 'library', label: 'KRA Library', icon: Layers },
                            { id: 'groups', label: 'Groups', icon: Users },
                            { id: 'assign', label: 'Assign KRAs', icon: Target }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-red-900/30 text-red-300 border border-red-800'}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <Trash2 size={18} />}
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto hover:underline text-xs">Dismiss</button>
                    </div>
                )}

                {/* --- TAB 1: KRA LIBRARY --- */}
                {activeTab === 'library' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                        {/* List */}
                        <div className="lg:col-span-8 bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6">
                            <h2 className="text-xl font-bold mb-4">Existing KRAs</h2>
                            <div className="space-y-4">
                                {kras.map(kra => (
                                    <div key={kra.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] hover:border-brand-purple/50 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white text-lg">{kra.name}</h3>
                                                <p className="text-sm text-brand-purple font-medium">{kra.goal_name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {kra.weightage && <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">Weight: {kra.weightage}%</span>}
                                                <button
                                                    onClick={() => handleDeleteKRA(kra.id)}
                                                    className="p-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg transition-colors"
                                                    title="Delete KRA"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-3">{kra.description}</p>
                                    </div>
                                ))}
                                {kras.length === 0 && <p className="text-gray-500 italic">No KRAs found. Create one to get started.</p>}
                            </div>
                        </div>

                        {/* Create Form */}
                        <div className="lg:col-span-4 bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6 h-fit sticky top-32">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-brand-purple" /> Create New KRA
                            </h2>
                            <form onSubmit={handleCreateKRA} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">KRA Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Performance Evaluation"
                                        value={newKRA.name}
                                        onChange={e => setNewKRA({ ...newKRA, name: e.target.value })}
                                        required
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Goal Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Adherence to schedules"
                                        value={newKRA.goal_name}
                                        onChange={e => setNewKRA({ ...newKRA, goal_name: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Weightage (%)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 20"
                                        value={newKRA.weightage}
                                        onChange={e => setNewKRA({ ...newKRA, weightage: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Description</label>
                                    <textarea
                                        placeholder="Detailed description of targets..."
                                        value={newKRA.description}
                                        onChange={e => setNewKRA({ ...newKRA, description: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none h-24 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-brand-purple text-white font-bold hover:bg-opacity-90 transition shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> {loading ? 'Saving...' : 'Save KRA'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}


                {/* --- TAB 2: GROUPS --- */}
                {activeTab === 'groups' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                        <div className="lg:col-span-4 bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6 h-fit sticky top-32">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-blue-500" /> Create Custom Group
                            </h2>
                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Group Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Interns 2024"
                                        value={newGroup.group_name}
                                        onChange={e => setNewGroup({ ...newGroup, group_name: e.target.value })}
                                        required
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Select Members</label>
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchGroupMembers}
                                        onChange={e => setSearchGroupMembers(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 mt-2 mb-2 text-white text-sm focus:border-brand-purple outline-none"
                                    />
                                    <div className="mt-2 max-h-48 overflow-y-auto border border-[#333] rounded-lg p-2 bg-[#1a1a1a] space-y-1">
                                        {employees
                                            .filter(emp =>
                                                emp.name.toLowerCase().includes(searchGroupMembers.toLowerCase()) ||
                                                emp.employee_code.toLowerCase().includes(searchGroupMembers.toLowerCase())
                                            )
                                            .map(emp => (
                                                <div
                                                    key={emp.employee_code}
                                                    onClick={() => toggleGroupMember(emp.employee_code)}
                                                    className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between ${newGroup.employee_codes.includes(emp.employee_code) ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/50' : 'hover:bg-[#222] text-gray-300'}`}
                                                >
                                                    <span>{emp.name}</span>
                                                    {newGroup.employee_codes.includes(emp.employee_code) && <CheckCircle size={14} />}
                                                </div>
                                            ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{newGroup.employee_codes.length} members selected</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-opacity-90 transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> {loading ? 'Creating...' : 'Create Group'}
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-8 bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6">
                            <h2 className="text-xl font-bold mb-4">Existing Groups</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.map(grp => (
                                    <div
                                        key={grp.id}
                                        onClick={() => handleOpenGroupDialog(grp)}
                                        className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex justify-between items-center group hover:border-blue-500/50 transition-all cursor-pointer"
                                    >
                                        <div>
                                            <h3 className="font-bold text-white">{grp.group_name}</h3>
                                            <p className="text-xs text-gray-500">{grp.description || 'No description'}</p>
                                        </div>
                                        <div className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-900/50">
                                            {grp.member_count} Members
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                {/* --- TAB 3: ASSIGN KRAs --- */}
                {activeTab === 'assign' && (
                    <div className="max-w-4xl mx-auto bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8 animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Target size={24} className="text-green-500" /> Assign KRAs to Employees
                        </h2>

                        <div className="space-y-6">
                            {/* 1. Select Target Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Assign To</label>
                                    <div className="flex gap-2 mt-2 bg-[#1a1a1a] p-1 rounded-lg border border-[#333]">
                                        {['individual', 'team', 'group'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setAssignment({ ...assignment, target_type: type as any, target_value: '' })}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${assignment.target_type === type ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Select Value based on Type */}
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Select Target</label>
                                    {assignment.target_type === 'individual' && (
                                        <input
                                            type="text"
                                            placeholder="Search employees..."
                                            value={searchAssignEmployees}
                                            onChange={e => setSearchAssignEmployees(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 mt-2 mb-1 text-white text-sm focus:border-green-500 outline-none"
                                        />
                                    )}
                                    <select
                                        value={assignment.target_value}
                                        onChange={e => setAssignment({ ...assignment, target_value: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-2 text-white focus:border-green-500 outline-none"
                                    >
                                        <option value="">-- Select --</option>
                                        {assignment.target_type === 'individual' && employees
                                            .filter(e =>
                                                e.name.toLowerCase().includes(searchAssignEmployees.toLowerCase()) ||
                                                e.employee_code.toLowerCase().includes(searchAssignEmployees.toLowerCase())
                                            )
                                            .map(e => <option key={e.employee_code} value={e.employee_code}>{e.name} ({e.employee_code})</option>)}
                                        {assignment.target_type === 'team' && teams.map(t => <option key={t} value={t}>{t}</option>)}
                                        {assignment.target_type === 'group' && groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Review Period</label>
                                    <input
                                        type="text"
                                        value={assignment.period}
                                        onChange={e => setAssignment({ ...assignment, period: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-2 text-white focus:border-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* 3. Select KRAs */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase block mb-2">Select KRAs to Assign</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                    {kras.map(kra => (
                                        <div
                                            key={kra.id}
                                            onClick={() => toggleKRASelection(kra.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${assignment.kra_ids.includes(kra.id)
                                                ? 'bg-green-900/20 border-green-500/50 text-white'
                                                : 'border-[#333] text-gray-400 hover:bg-[#222]'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm">{kra.name}</span>
                                                {assignment.kra_ids.includes(kra.id) && <CheckCircle size={16} className="text-green-500" />}
                                            </div>
                                            <div className="text-xs opacity-70 mt-1 truncate">{kra.goal_name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#333] flex justify-end">
                                <button
                                    onClick={handleAssign}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-600/20 hover:bg-opacity-90 transition-all flex items-center gap-2"
                                >
                                    <Target size={18} />
                                    {loading ? 'Assigning...' : 'Assign KRAs'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Group Member Management Dialog */}
                {showGroupDialog && selectedGroup && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#111] border border-blue-900/50 rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-900/30 rounded-full">
                                        <Users className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selectedGroup.group_name}</h3>
                                        <p className="text-sm text-gray-400">{selectedGroup.description || 'Manage group members'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowGroupDialog(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Current Members */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Current Members ({groupMembers.length})</h4>
                                    <div className="space-y-2 max-h-80 overflow-y-auto bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        {groupMembers.map(member => (
                                            <div
                                                key={member.employee_code}
                                                className={`p-3 rounded-lg border flex justify-between items-center transition-all ${membersToRemove.includes(member.employee_code)
                                                    ? 'bg-red-900/20 border-red-500/50'
                                                    : 'border-[#333] hover:bg-[#222]'
                                                    }`}
                                            >
                                                <div>
                                                    <p className="font-bold text-white text-sm">{member.name}</p>
                                                    <p className="text-xs text-gray-500">{member.team} • {member.designation}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setMembersToRemove(prev =>
                                                            prev.includes(member.employee_code)
                                                                ? prev.filter(c => c !== member.employee_code)
                                                                : [...prev, member.employee_code]
                                                        );
                                                    }}
                                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${membersToRemove.includes(member.employee_code)
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                                                        }`}
                                                >
                                                    {membersToRemove.includes(member.employee_code) ? 'Undo' : 'Remove'}
                                                </button>
                                            </div>
                                        ))}
                                        {groupMembers.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No members in this group</p>
                                        )}
                                    </div>
                                </div>

                                {/* Add New Members */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Add Members</h4>
                                    <div className="space-y-2 max-h-80 overflow-y-auto bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        {employees
                                            .filter(emp => !groupMembers.find(m => m.employee_code === emp.employee_code))
                                            .map(emp => (
                                                <div
                                                    key={emp.employee_code}
                                                    className={`p-3 rounded-lg border flex justify-between items-center transition-all ${membersToAdd.includes(emp.employee_code)
                                                        ? 'bg-green-900/20 border-green-500/50'
                                                        : 'border-[#333] hover:bg-[#222]'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{emp.name}</p>
                                                        <p className="text-xs text-gray-500">{emp.team}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setMembersToAdd(prev =>
                                                                prev.includes(emp.employee_code)
                                                                    ? prev.filter(c => c !== emp.employee_code)
                                                                    : [...prev, emp.employee_code]
                                                            );
                                                        }}
                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${membersToAdd.includes(emp.employee_code)
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                                                            }`}
                                                    >
                                                        {membersToAdd.includes(emp.employee_code) ? 'Selected' : 'Add'}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-[#333]">
                                <button
                                    onClick={handleDeleteGroup}
                                    disabled={loading}
                                    className="px-4 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete Group
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => setShowGroupDialog(false)}
                                    className="px-4 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateGroupMembers}
                                    disabled={loading || (membersToAdd.length === 0 && membersToRemove.length === 0)}
                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : `Update Group ${membersToAdd.length > 0 || membersToRemove.length > 0 ? `(${membersToAdd.length > 0 ? `+${membersToAdd.length}` : ''}${membersToRemove.length > 0 ? ` -${membersToRemove.length}` : ''})` : ''}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
