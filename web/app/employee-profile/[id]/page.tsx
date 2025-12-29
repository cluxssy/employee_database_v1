'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, Award, BookOpen, User, Monitor, FileText, TrendingUp, ClipboardCheck, Trash2, Target } from 'lucide-react';
import StaggeredMenu from '../../../components/navBar';
import Waves from '../../../components/Background/Waves';
import { useAuth } from '../../../context/AuthContext';
import { getMenuItems } from '../../../utils/menu';

interface SkillMatrix {
    primary_skillset?: string;
    secondary_skillset?: string;
    experience_years?: string;
    last_contact_date?: string;
}

interface Asset {
    asset_id: string;
    issued_to?: string;
    issue_date?: string;
    return_date?: string;
    laptop_returned?: string;
    advance_salary_adjustment?: string;
    leave_adjustment?: string;
}

interface Performance {
    monthly_check_in_notes?: string;
    manager_feedback?: string;
    improvement_areas?: string;
    recognition_rewards?: string;
}

interface HRActivity {
    training_assigned?: string;
    training_date?: string;
    training_duration?: string;
    training_status?: string;
    status?: string;
    last_follow_up?: string;
}

interface Employee {
    employee_code: string;
    name: string;
    designation: string;
    team: string;
    email_id: string;
    photo_path: string | null;
    phone?: string;
    location?: string;
    join_date?: string;

    // Detailed Fields
    dob?: string;
    contact_number?: string;
    emergency_contact?: string;
    current_address?: string;
    permanent_address?: string;
    doj?: string; // Date of Joining
    employment_type?: string;
    reporting_manager?: string;
    employment_status?: string;
    exit_date?: string;
    cv_path?: string;
    pf_included?: string;
    mediclaim_included?: string;

    // Additional DB Fields
    id_proofs?: string;
    notes?: string;
    exit_reason?: string;
    clearance_status?: string;

    // Master Checklist
    checklist_bag?: string | number;
    checklist_mediclaim?: string | number;
    checklist_pf?: string | number;
    checklist_email_access?: string | number;
    checklist_groups?: string | number;
    checklist_relieving_letter?: string | number;

    // Nested Data
    skill_matrix?: SkillMatrix;
    assets?: Asset[];
    performance?: Performance[];
    hr_activity?: HRActivity[];
    kra_assignments?: KRAAssignment[];
}

interface KRAAssignment {
    assignment_id: number;
    kra_id: number;
    period: string;
    status: string;
    assigned_at: string;
    kra_name: string;
    goal_name?: string;
    description?: string;
    weightage?: number;
}

export default function EmployeeProfile() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'performance'>('overview');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const menuItems = getMenuItems(user?.role);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }

        if (params.id) {
            fetchEmployeeDetails(params.id as string);
        }
    }, [params.id, router]);

    const fetchEmployeeDetails = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/employee/${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
            } else {
                console.error('Employee not found');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async () => {
        if (!employee) return;

        try {
            const res = await fetch(`http://localhost:8000/api/employee/${employee.employee_code}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                // Successfully deleted, redirect to directory
                router.push('/employee-directory');
            } else {
                const error = await res.json();
                alert(`Failed to delete employee: ${error.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete employee. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
                <div className="animate-pulse">Loading profile...</div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-white gap-4">
                <div className="text-xl">Employee not found</div>
                <button onClick={() => router.back()} className="text-brand-purple hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
            <Waves
                lineColor={"#230a46ff"}
                backgroundColor="rgba(0, 0, 0, 0.2)"
                waveSpeedX={0.02}
                waveSpeedY={0.01}
                waveAmpX={40}
                waveAmpY={20}
                friction={0.9}
                tension={0.01}
                maxCursorMove={120}
                xGap={12}
                yGap={36}
                className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-none"
            />

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

            <main className="mx-auto max-w-7xl p-6 pt-32 relative z-10 animate-fade-in-up">

                {/* Header & Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} /> Back to Directory
                    </button>

                    <div className="flex bg-[#222] p-1 rounded-full border border-[#333]">
                        {['overview', 'assets', 'performance'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Essential Info Card (Always Visible) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111]/90 backdrop-blur-xl border border-[#222] rounded-3xl p-8 flex flex-col items-center text-center sticky top-32 shadow-2xl">
                            {/* Profile Image */}
                            <div className="relative mb-6">
                                <div className="w-48 h-48 rounded-full p-1.5 bg-gradient-to-br from-brand-purple to-cyan-500 shadow-2xl shadow-brand-purple/20">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                                        {employee.photo_path ? (
                                            <img
                                                src={`http://localhost:8000/static/${employee.photo_path}`}
                                                alt={employee.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <User size={64} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Status Dot */}
                                <div className={`absolute bottom-3 right-3 w-8 h-8 rounded-full border-4 border-[#111] ${(!employee.employment_status || employee.employment_status === 'Active') ? 'bg-green-500' : 'bg-red-500'}`} title={employee.employment_status || 'Active'}></div>
                            </div>

                            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{employee.name}</h1>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple text-sm font-semibold border border-brand-purple/20 mb-8">
                                {employee.designation}
                            </div>

                            {/* Key Info */}
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#161616] border border-[#222]">
                                    <Mail className="text-gray-400" size={18} />
                                    <div className="text-left overflow-hidden">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Email</p>
                                        <p className="text-sm text-gray-200 truncate">{employee.email_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#161616] border border-[#222]">
                                    <Phone className="text-gray-400" size={18} />
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Contact</p>
                                        <p className="text-sm text-gray-200">{employee.contact_number || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {employee.cv_path && (
                                <a
                                    href={`http://localhost:8000/static/${employee.cv_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 w-full py-3 rounded-xl bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all border border-[#333]"
                                >
                                    <FileText size={18} /> Download CV
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dynamic Tabs */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Status Banner */}
                        {employee.employment_status === 'Exited' && (
                            <div className="bg-red-900/20 border border-red-900/50 rounded-2xl p-4 flex items-center gap-4 text-red-200">
                                <div className="p-2 bg-red-900/30 rounded-full"><User size={20} /></div>
                                <div>
                                    <p className="font-bold">Employment Ended</p>
                                    <p className="text-xs opacity-80">Exit Date: {employee.exit_date || 'N/A'}</p>
                                    {employee.exit_reason && <p className="text-xs opacity-80 mt-1">Reason: {employee.exit_reason}</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Professional & Skills */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#222] pb-4">
                                        <Briefcase className="text-brand-purple" size={20} /> Professional Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Employee Code</label>
                                            <p className="text-lg font-mono text-white">{employee.employee_code}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Team</label>
                                            <p className="text-lg text-white">{employee.team}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Manager</label>
                                            <p className="text-lg text-white">{employee.reporting_manager || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase tracking-wider">Joined</label>
                                            <p className="text-lg text-white">{employee.doj || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Skills Matrix */}
                                    {employee.skill_matrix && (
                                        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#222]">
                                            <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-white">
                                                <BookOpen size={18} className="text-blue-500" /> Skill Matrix
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase mb-1">Primary Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {employee.skill_matrix.primary_skillset?.split(',').map((s, i) => (
                                                            <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-900/50">{s.trim()}</span>
                                                        )) || <span className="text-gray-500">-</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase mb-1">Secondary Skills</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {employee.skill_matrix.secondary_skillset?.split(',').map((s, i) => (
                                                            <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">{s.trim()}</span>
                                                        )) || <span className="text-gray-500">-</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase mb-1">Experience</p>
                                                    <p className="text-sm text-gray-200">{employee.skill_matrix.experience_years} Years</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Personal Info */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#222] pb-4">
                                        <User className="text-green-500" size={20} /> Personal Info
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">Date of Birth</label>
                                            <p className="text-gray-200">{employee.dob || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">Emergency Contact</label>
                                            <p className="text-gray-200">{employee.emergency_contact || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">Location</label>
                                            <p className="text-gray-200">{employee.location || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">Employment Type</label>
                                            <p className="text-gray-200">{employee.employment_type || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2 border-t border-[#222] pt-4 mt-2">
                                            <label className="text-xs text-gray-500 uppercase">Current Address</label>
                                            <p className="text-gray-300 text-sm mt-1">{employee.current_address || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2 border-t border-[#222] pt-0">
                                            <label className="text-xs text-gray-500 uppercase">Permanent Address</label>
                                            <p className="text-gray-300 text-sm mt-1">{employee.permanent_address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Benefits & Documents */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-[#222] pb-4">
                                        <FileText className="text-purple-500" size={20} /> Benefits & Documents
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">PF Included</label>
                                            <p className="text-gray-200">{employee.pf_included || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">Mediclaim</label>
                                            <p className="text-gray-200">{employee.mediclaim_included || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">ID Proofs</label>
                                            {employee.id_proofs ? (
                                                <a href={`http://localhost:8000/static/${employee.id_proofs}`} target="_blank" className="text-brand-purple hover:underline text-sm block mt-1">View Document</a>
                                            ) : <p className="text-gray-500 text-sm">Not uploaded</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-xs text-gray-500 uppercase">Notes</label>
                                            <p className="text-gray-400 text-sm mt-1">{employee.notes || 'No additional notes.'}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'assets' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Monitor className="text-yellow-500" size={20} /> Assigned Assets
                                    </h2>
                                    {employee.assets && employee.assets.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-[#333] text-gray-500 text-xs uppercase tracking-wider relative">
                                                        <th className="pb-3 pl-2">Asset ID</th>
                                                        <th className="pb-3">Issued Date</th>
                                                        <th className="pb-3">Return Date</th>
                                                        <th className="pb-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {employee.assets.map((asset, idx) => (
                                                        <tr key={idx} className="border-b border-[#222] last:border-0 hover:bg-[#1a1a1a]">
                                                            <td className="py-4 pl-2 font-mono text-brand-purple">{asset.asset_id}</td>
                                                            <td className="py-4 text-gray-300">{asset.issue_date || '-'}</td>
                                                            <td className="py-4 text-gray-300">{asset.return_date || '-'}</td>
                                                            <td className="py-4">
                                                                <span className={`px-2 py-1 rounded text-xs ${asset.return_date ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                                                                    {asset.return_date ? 'Returned' : 'Assigned'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No assets assigned or recorded.</p>
                                    )}
                                </section>

                                {/* Clearance Checklist - Only for Exited Employees */}
                                {/* Clearance Checklist - Visible for All */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8 mb-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <ClipboardCheck className="text-brand-purple" size={20} /> Master Checklist Status
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Bag', val: employee.checklist_bag },
                                            { label: 'Email Access', val: employee.checklist_email_access },
                                            { label: 'Groups', val: employee.checklist_groups },
                                            { label: 'Relieving Letter', val: employee.checklist_relieving_letter }
                                        ].map((item, i) => {
                                            const isChecked = !!item.val;
                                            // Standard: Checked(1)=Yes(Green), Unchecked(0)=No(Red)

                                            const text = isChecked ? 'Yes' : 'No';
                                            const colorClass = isChecked
                                                ? 'bg-green-900/30 text-green-400 border-green-900/50'
                                                : 'bg-red-900/30 text-red-500 border-red-900/50';

                                            return (
                                                <div key={i} className="flex justify-between items-center p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                                                    <span className="text-gray-300 text-sm">{item.label}</span>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded border ${colorClass}`}>
                                                        {text}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                            </div>
                        )}

                        {activeTab === 'performance' && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Performance Reviews */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <TrendingUp className="text-brand-purple" size={20} /> Performance Reviews
                                    </h2>
                                    {employee.performance && employee.performance.length > 0 ? (
                                        <div className="space-y-4">
                                            {employee.performance.map((perf, idx) => (
                                                <div key={idx} className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222]">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="p-2 bg-brand-purple/20 rounded-lg text-brand-purple">
                                                            <Award size={20} />
                                                        </div>
                                                        <div className="space-y-3 flex-1">
                                                            <div className="mb-4 pb-4 border-b border-[#222]">
                                                                <p className="text-xs text-gray-500 uppercase">Monthly Check-in</p>
                                                                <p className="text-gray-200 mt-1 italic">"{perf.monthly_check_in_notes || 'No notes'}"</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 uppercase">Manager Feedback</p>
                                                                <p className="text-gray-200 mt-1">{perf.manager_feedback || 'No feedback recorded.'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 uppercase">Areas of Improvement</p>
                                                                <p className="text-gray-200 mt-1">{perf.improvement_areas || '-'}</p>
                                                            </div>
                                                            {perf.recognition_rewards && (
                                                                <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded-lg">
                                                                    <p className="text-xs text-yellow-500 uppercase font-bold">Rewards & Recognition</p>
                                                                    <p className="text-yellow-200 text-sm mt-1">{perf.recognition_rewards}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No performance records found.</p>
                                    )}
                                </section>

                                {/* KRA Assignments */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Target className="text-green-500" size={20} /> KRA Assignments
                                    </h2>
                                    {employee.kra_assignments && employee.kra_assignments.length > 0 ? (
                                        <div className="space-y-4">
                                            {employee.kra_assignments.map((kra) => (
                                                <div key={kra.assignment_id} className="bg-[#1a1a1a] rounded-xl p-6 border border-[#222] hover:border-green-500/30 transition-all">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-white mb-1">{kra.kra_name}</h3>
                                                            {kra.goal_name && (
                                                                <p className="text-sm text-green-400 font-medium">{kra.goal_name}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {kra.weightage && (
                                                                <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300 font-medium">
                                                                    Weight: {kra.weightage}%
                                                                </span>
                                                            )}
                                                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${kra.status === 'Completed'
                                                                ? 'bg-green-900/30 border-green-800 text-green-400'
                                                                : 'bg-blue-900/30 border-blue-800 text-blue-400'
                                                                }`}>
                                                                {kra.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {kra.description && (
                                                        <p className="text-gray-400 text-sm mb-4">{kra.description}</p>
                                                    )}
                                                    <div className="flex gap-6 text-xs text-gray-500">
                                                        <div>
                                                            <span className="uppercase text-[10px] text-gray-600">Period</span>
                                                            <p className="text-gray-300 mt-1">{kra.period}</p>
                                                        </div>
                                                        <div>
                                                            <span className="uppercase text-[10px] text-gray-600">Assigned On</span>
                                                            <p className="text-gray-300 mt-1">
                                                                {new Date(kra.assigned_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No KRAs assigned to this employee yet.</p>
                                    )}
                                </section>

                                {/* HR Activity */}
                                <section className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <ClipboardCheck className="text-pink-500" size={20} /> HR Activity
                                    </h2>
                                    {employee.hr_activity && employee.hr_activity.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {employee.hr_activity.map((hr, idx) => (
                                                <div key={idx} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222] space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-bold text-white max-w-[70%]">{hr.training_assigned}</p>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${hr.training_status === 'Completed' ? 'bg-green-900/40 border-green-800 text-green-400' : 'bg-blue-900/40 border-blue-800 text-blue-400'}`}>
                                                            {hr.training_status || 'Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                                        <div>
                                                            <span className="block text-[#555] uppercase text-[10px]">Date</span>
                                                            {hr.training_date || '-'}
                                                        </div>
                                                        <div>
                                                            <span className="block text-[#555] uppercase text-[10px]">Duration</span>
                                                            {hr.training_duration || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No HR activities recorded.</p>
                                    )}
                                </section>
                            </div>
                        )}

                    </div>
                </div>

                {/* Delete Employee Section */}
                <div className="mt-12 pt-8 border-t border-red-900/30">
                    <div className="bg-red-950/20 border border-red-900/50 rounded-3xl p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                                    <Trash2 size={20} />
                                    Danger Zone
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Permanently delete this employee and all associated records. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <Trash2 size={18} />
                                Delete Employee
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#111] border border-red-900/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-900/30 rounded-full">
                                    <Trash2 className="text-red-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                            </div>
                            <p className="text-gray-300 mb-6">
                                Are you sure you want to delete <span className="font-bold text-white">{employee?.name}</span> ({employee?.employee_code})?
                                <br /><br />
                                This will permanently remove:
                            </p>
                            <ul className="text-sm text-gray-400 mb-6 space-y-1 ml-4">
                                <li>• Employee profile and personal information</li>
                                <li>• Skill matrix and experience data</li>
                                <li>• Asset assignments and history</li>
                                <li>• Performance records and feedback</li>
                                <li>• HR activities and training records</li>
                            </ul>
                            <p className="text-red-400 text-sm font-bold mb-6">
                                ⚠️ This action cannot be undone!
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        handleDeleteEmployee();
                                    }}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                                >
                                    Delete Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main >
        </div >
    );
}
