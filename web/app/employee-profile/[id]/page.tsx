'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, Award, BookOpen, User, Monitor, FileText, TrendingUp, ClipboardCheck, Trash2, Target, Edit2, Save, ArrowRight, Settings, AlertCircle } from 'lucide-react';
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
    const [showOffboardModal, setShowOffboardModal] = useState(false);

    // Options for Dropdowns
    const [options, setOptions] = useState<{ teams: string[], designations: string[], managers: { name: string, code: string }[] }>({ teams: [], designations: [], managers: [] });

    useEffect(() => {
        // Fetch dropdown options
        const fetchOptions = async () => {
            try {
                const res = await fetch('/api/options', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setOptions(data);
                }
            } catch (error) {
                console.error("Failed to fetch options", error);
            }
        };
        fetchOptions();
    }, []);


    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Employee>>({});

    const menuItems = getMenuItems(user?.role);
    // PERMISSIONS LOGIC
    // 1. Employees: Can ONLY edit their own contact info (Phone, Emergency, Address) - NOT Name, Team, Role, etc.
    // 2. Admins/HR: Can edit EVERYTHING including Name, Team, DOJ, Exit Date, etc.
    const isOwner = user?.employee_code === params.id;
    const isAdminOrHR = user && ['Admin', 'HR'].includes(user.role);

    // "Can Edit" means different things for different users
    const canEdit = isAdminOrHR || isOwner;
    const canDelete = isAdminOrHR;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }
        if (params.id) fetchEmployeeDetails(params.id as string);
    }, [params.id, router, user, authLoading]);

    const fetchEmployeeDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/employee/${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setEmployee(data);
                setEditForm(data); // Initialize edit form
            } else {
                console.error('Employee not found');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (field: keyof Employee, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillChange = (field: 'primary_skillset' | 'secondary_skillset', value: string) => {
        setEditForm(prev => ({
            ...prev,
            skill_matrix: {
                ...prev.skill_matrix,
                [field]: value
            }
        }));
    };

    const saveChanges = async () => {
        if (!employee) return;
        try {
            const res = await fetch(`/api/employee/${employee.employee_code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
                credentials: 'include'
            });
            if (res.ok) {
                setEmployee({ ...employee, ...editForm } as Employee);
                setIsEditing(false);
                // Optionally show toast success
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving changes');
        }
    };

    const handleDeleteEmployee = async () => {
        if (!employee) return;
        try {
            const res = await fetch(`/api/employee/${employee.employee_code}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                router.push('/employee-directory');
            } else {
                const error = await res.json();
                alert(`Failed to delete: ${error.detail}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
            <div className="animate-pulse">Loading profile...</div>
        </div>
    );
    if (!employee) return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-white gap-4">
            <div className="text-xl">Employee not found</div>
            <button onClick={() => router.back()} className="text-brand-purple hover:underline">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
            <Waves lineColor="#230a46ff" backgroundColor="rgba(0,0,0,0.2)" className="fixed inset-0 pointer-events-none z-0" />

            <StaggeredMenu
                position="right"
                isFixed={true}
                items={menuItems}
                displayItemNumbering={true}
                smartHeader={true}
                logoUrl="/logo.png"
                menuBackgroundColor="#000000ff"
            />

            <main className="mx-auto max-w-7xl p-6 pt-32 relative z-10 animate-fade-in-up">

                {/* 1. Header Card (Glassmorphism) */}
                <div className="relative rounded-[3rem] overflow-hidden bg-[#111]/80 backdrop-blur-xl border border-[#222] shadow-2xl mb-8">
                    {/* Cover Background */}
                    <div className="h-48 bg-gradient-to-r from-brand-purple/20 via-blue-900/20 to-brand-purple/20"></div>

                    <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-20">
                        {/* Profile Pic */}
                        <div className="relative flex-shrink-0">
                            <div className="w-40 h-40 rounded-full p-1 bg-[#111] overflow-hidden shadow-2xl">
                                <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden relative group">
                                    {employee.photo_path ? (
                                        <img src={`/static/${employee.photo_path}`} alt={employee.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={64} /></div>
                                    )}
                                    {/* <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <Camera size={24} />
                                    </button> */}
                                </div>
                            </div>
                            <div className={`absolute bottom-4 right-4 w-6 h-6 rounded-full border-4 border-[#111] ${(!employee.employment_status || employee.employment_status === 'Active') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 mb-2 text-center md:text-left">
                            {isEditing && isAdminOrHR ? (
                                <div className="space-y-2 mb-4">
                                    <input
                                        value={editForm.name || ''}
                                        onChange={(e) => handleEditChange('name', e.target.value)}
                                        className="text-4xl font-bold text-white bg-transparent border-b border-white/20 outline-none w-full"
                                        placeholder="Full Name"
                                    />
                                    <input
                                        value={editForm.designation || ''}
                                        onChange={(e) => handleEditChange('designation', e.target.value)}
                                        className="text-xl text-brand-purple font-medium bg-transparent border-b border-white/20 outline-none w-full"
                                        placeholder="Designation"
                                    />
                                    <div className="flex gap-2">
                                        <div className="w-1/3">
                                            <select
                                                value={editForm.team || ''}
                                                onChange={(e) => handleEditChange('team', e.target.value)}
                                                className="text-sm text-gray-400 bg-transparent border-b border-white/20 outline-none w-full appearance-none"
                                            >
                                                <option value="" className="bg-black">Select Team</option>
                                                {/* We need options here. Let's use a datalist or select if we have options state in this component */}
                                                {options.teams.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                                            </select>
                                        </div>

                                        <input
                                            value={editForm.location || ''}
                                            onChange={(e) => handleEditChange('location', e.target.value)}
                                            className="text-sm text-gray-400 bg-transparent border-b border-white/20 outline-none w-1/3"
                                            placeholder="Location"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-4xl font-bold text-white mb-1">{employee.name}</h1>
                                    <p className="text-xl text-brand-purple font-medium">{employee.designation}</p>
                                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><Briefcase size={14} /> {employee.team}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {employee.location || 'Remote'}</span>
                                        <span className="flex items-center gap-1"><Mail size={14} /> {employee.email_id}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mb-4">
                            {canEdit && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-brand-purple/25 flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            )}
                            {isEditing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white rounded-full font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveChanges}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium transition-all flex items-center gap-2"
                                    >
                                        <Save size={16} /> Save
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Panel: Personal Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <User size={18} className="text-brand-purple" /> Personal Details
                            </h3>
                            <div className="space-y-4">
                                <InfoField label="Employee ID" value={employee.employee_code} />
                                <InfoField label="Date of Joining" value={employee.doj} />

                                {isEditing ? (
                                    <>
                                        {/* Fields editable by EVERYONE (Owner + Admin) */}
                                        <div className="p-3 bg-[#1a1a1a] rounded-xl border border-[#333] space-y-3">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Contact Info (Editable)</p>
                                            <EditField label="Phone" value={editForm.contact_number} onChange={(v) => handleEditChange('contact_number', v)} />
                                            <EditField label="Emergency Contact" value={editForm.emergency_contact} onChange={(v) => handleEditChange('emergency_contact', v)} />
                                            <EditField label="Current Address" value={editForm.current_address} onChange={(v) => handleEditChange('current_address', v)} />
                                            <EditField label="Permanent Address" value={editForm.permanent_address} onChange={(v) => handleEditChange('permanent_address', v)} />
                                        </div>

                                        {/* Fields editable ONLY by Admin/HR */}
                                        {isAdminOrHR && (
                                            <div className="p-3 bg-red-900/10 rounded-xl border border-red-900/30 space-y-3 mt-4">
                                                <p className="text-xs text-red-400 uppercase font-bold flex items-center gap-2"><Settings size={12} /> Admin Only</p>
                                                <EditField label="Date of Joining" value={editForm.doj} onChange={(v) => handleEditChange('doj', v)} />
                                                <EditField label="Employment Status" value={editForm.employment_status} onChange={(v) => handleEditChange('employment_status', v)} />
                                                <EditField label="Exit Date" value={editForm.exit_date} onChange={(v) => handleEditChange('exit_date', v)} />
                                                <EditField label="Email" value={editForm.email_id} onChange={(v) => handleEditChange('email_id', v)} />

                                                <div className="space-y-1 py-1">
                                                    <label className="text-xs text-brand-purple font-bold uppercase">Reporting Manager</label>
                                                    <select
                                                        value={editForm.reporting_manager || ''}
                                                        onChange={(e) => handleEditChange('reporting_manager', e.target.value)}
                                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple outline-none transition-colors"
                                                    >
                                                        <option value="">Select Manager</option>
                                                        {options.managers.map(m => (
                                                            <option key={m.code} value={m.name}>{m.name} ({m.code})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Read-only for Employee */}
                                        {!isAdminOrHR && (
                                            <InfoField label="Date of Joining" value={employee.doj} />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <InfoField label="Phone" value={employee.contact_number} />
                                        <InfoField label="Emergency" value={employee.emergency_contact} />
                                        <InfoField label="Location" value={employee.location} />
                                        <InfoField label="Reporting Manager" value={employee.reporting_manager} />

                                        <div className="pt-2 border-t border-[#222]">
                                            <p className="text-xs text-gray-500 uppercase mb-2">Address Details</p>
                                            <div className="mb-3">
                                                <span className="text-xs text-brand-purple font-medium">Current Address</span>
                                                <p className="text-sm text-gray-300">{employee.current_address || 'Not Updated'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-brand-purple font-medium">Permanent Address</span>
                                                <p className="text-sm text-gray-300">{employee.permanent_address || 'Not Updated'}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-blue-400" /> Documents
                            </h3>
                            <div className="space-y-3">
                                {employee.cv_path ? (
                                    <a href={`/static/${employee.cv_path}`} target="_blank" className="block w-full py-3 px-4 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-sm text-gray-300 transition-all border border-[#333] flex justify-between items-center group">
                                        <span>Resume / CV</span>
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </a>
                                ) : null}

                                {employee.id_proofs ? (
                                    <a href={`/static/${employee.id_proofs}`} target="_blank" className="block w-full py-3 px-4 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-sm text-gray-300 transition-all border border-[#333] flex justify-between items-center group">
                                        <span>ID Proofs</span>
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </a>
                                ) : null}

                                {!employee.cv_path && !employee.id_proofs && <div className="text-sm text-gray-500">No documents uploaded.</div>}
                            </div>
                        </section>
                    </div>

                    {/* Right Panel: Tabs System (Overview, Performance, Assets) */}
                    <div className="lg:col-span-2">
                        {/* Custom Tab Switcher */}
                        <div className="flex gap-2 mb-6 bg-[#111]/60 p-1.5 rounded-2xl w-fit border border-[#222]">
                            {['overview', 'performance', 'assets'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                                        : 'text-gray-400 hover:text-white hover:bg-[#222]'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="animate-fade-in-up">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Skill Matrix */}
                                    <div className="bg-[#111]/60 border border-[#222] rounded-3xl p-8">
                                        <h3 className="text-xl font-bold mb-6">Skills & Expertise</h3>
                                        {employee.skill_matrix ? (
                                            <div className="space-y-6">
                                                <div>
                                                    <span className="text-xs text-brand-purple uppercase font-bold tracking-wider mb-2 block">Primary Skills</span>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.skill_matrix?.primary_skillset || ''}
                                                            onChange={(e) => handleSkillChange('primary_skillset', e.target.value)}
                                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple outline-none"
                                                            placeholder="React, Node.js, Python..."
                                                        />
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {employee.skill_matrix.primary_skillset?.split(',').map((s: string, i: number) => (
                                                                <span key={i} className="px-3 py-1 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple rounded-lg text-sm">{s.trim()}</span>
                                                            ))}
                                                            {!employee.skill_matrix.primary_skillset && <span className="text-gray-500 text-sm">No primary skills added.</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Secondary Skills</span>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.skill_matrix?.secondary_skillset || ''}
                                                            onChange={(e) => handleSkillChange('secondary_skillset', e.target.value)}
                                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple outline-none"
                                                            placeholder="AWS, Docker, Figma..."
                                                        />
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {employee.skill_matrix.secondary_skillset?.split(',').map((s: string, i: number) => (
                                                                <span key={i} className="px-3 py-1 bg-[#222] border border-[#333] text-gray-300 rounded-lg text-sm">{s.trim()}</span>
                                                            ))}
                                                            {!employee.skill_matrix.secondary_skillset && <span className="text-gray-500 text-sm">No secondary skills added.</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No skills recorded.</p>
                                        )}
                                    </div>

                                    {/* About / Notes */}
                                    <div className="bg-[#111]/60 border border-[#222] rounded-3xl p-8">
                                        <h3 className="text-xl font-bold mb-4">Additional Notes</h3>
                                        <p className="text-gray-400 leading-relaxed">
                                            {employee.notes || "No additional notes available for this employee."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'performance' && (
                                <div className="space-y-6">
                                    <div className="bg-[#111]/60 border border-[#222] rounded-3xl p-8">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Target className="text-brand-purple" /> Goals & KRAs
                                        </h3>
                                        {employee.kra_assignments && employee.kra_assignments.length > 0 ? (
                                            <div className="grid gap-4">
                                                {employee.kra_assignments.map((kra: any, i: number) => (
                                                    <div key={i} className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333] hover:border-brand-purple/40 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-lg">{kra.kra_name}</h4>
                                                            <span className={`px-2 py-1 text-xs rounded font-bold ${kra.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                                {kra.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-400 text-sm mb-4">{kra.description}</p>
                                                        <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                                                            <div className={`h-full ${kra.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: kra.status === 'Completed' ? '100%' : '50%' }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 text-gray-500">No Performance Records Found</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'assets' && (
                                <div className="space-y-6">
                                    <div className="bg-[#111]/60 border border-[#222] rounded-3xl p-8">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Monitor className="text-brand-purple" /> Devices
                                        </h3>
                                        {employee.assets && employee.assets.length > 0 ? (
                                            <div className="grid gap-4">
                                                {employee.assets.map((asset: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center text-gray-400">
                                                                <Monitor size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white">{asset.asset_id}</p>
                                                                <p className="text-xs text-gray-500">Issued: {asset.issue_date}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 text-xs rounded-full border ${asset.laptop_returned ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'}`}>
                                                            {asset.laptop_returned ? 'Returned' : 'Assigned'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 text-gray-500">No Assets Assigned</div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Admin Zone - Offboarding & Deletion */}
                {canDelete && (
                    <div className="mt-20 pt-10 border-t border-[#222]">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Admin Actions</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowOffboardModal(true)}
                                    className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-800 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    <AlertCircle size={16} /> Offboard Employee
                                </button>

                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete Permanent
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Offboard Confirmation Modal */}
                {showOffboardModal && (
                    <OffboardModal
                        employee={employee}
                        onClose={() => setShowOffboardModal(false)}
                        onSuccess={() => {
                            setShowOffboardModal(false);
                            fetchEmployeeDetails(employee.employee_code); // Refresh data
                        }}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#111] border border-red-900/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                            <p className="text-gray-300 mb-6">This will permanently remove {employee.name}. This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors font-medium">Cancel</button>
                                <button onClick={handleDeleteEmployee} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

// Helpers
function InfoField({ label, value }: { label: string, value?: string | null }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-[#222] last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm text-gray-200 font-medium truncate max-w-[60%]">{value || '-'}</span>
        </div>
    );
}

function EditField({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-1 py-1">
            <label className="text-xs text-brand-purple font-bold uppercase">{label}</label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-brand-purple outline-none transition-colors"
            />
        </div>
    );
}

function OffboardModal({ employee, onClose, onSuccess }: any) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        exit_date: new Date().toISOString().split('T')[0],
        exit_reason: 'Resignation'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/employee/${employee.employee_code}/offboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert("Failed to offboard employee");
            }
        } catch (e) {
            console.error(e);
            alert("Error offboarding employee");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-yellow-800/50 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="p-6 border-b border-yellow-900/30">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertCircle className="text-yellow-500" /> Offboard Employee
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Deactivate account and mark as Exited.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-bold">Exit Date</label>
                            <input
                                type="date"
                                value={form.exit_date}
                                onChange={e => setForm({ ...form, exit_date: e.target.value })}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-yellow-600 outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-bold">Reason for Exit</label>
                            <select
                                value={form.exit_reason}
                                onChange={e => setForm({ ...form, exit_reason: e.target.value })}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white focus:border-yellow-600 outline-none"
                            >
                                <option>Resignation</option>
                                <option>Termination</option>
                                <option>Absconding</option>
                                <option>Contract End</option>
                                <option>Retirement</option>
                                <option>Death</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-yellow-900/20"
                        >
                            {submitting ? 'Processing...' : 'Confirm Offboard'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
