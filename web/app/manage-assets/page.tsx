'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor, Save, Search, CheckCircle, XCircle, Trash2, Calendar } from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

interface Employee {
    employee_code: string;
    name: string;
    designation?: string;
}

interface Asset {
    id: number;
    employee_code: string;
    asset_id: string;
    issued_to: string;
    issue_date: string;
    return_date?: string;
    laptop_returned?: number; // 0 or 1
}

interface EmployeeDetails extends Employee {
    checklist_bag?: number;
    checklist_mediclaim?: number;
    checklist_pf?: number;
    checklist_email_access?: number;
    checklist_groups?: number;
    checklist_relieving_letter?: number;
}



export default function ManageAssets() {
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



    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newAsset, setNewAsset] = useState({ asset_id: '', issue_date: '' });

    const menuItems = getMenuItems(user?.role);



    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/employees', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (err) {
            console.error(err);
        }
    };



    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployeeData = async (code: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/employee/${code}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setEmployeeDetails(data);
                setAssets(data.assets || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEmployee = (emp: Employee) => {
        setSelectedEmployee(emp);
        setSearchTerm(emp.name);
        fetchEmployeeData(emp.employee_code);
    };

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            const res = await fetch('http://localhost:8000/api/assets/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_code: selectedEmployee.employee_code,
                    asset_id: newAsset.asset_id,
                    issued_to: selectedEmployee.name,
                    issue_date: newAsset.issue_date
                })
            });

            if (res.ok) {
                setNewAsset({ asset_id: '', issue_date: '' }); // Reset form
                if (selectedEmployee) fetchEmployeeData(selectedEmployee.employee_code); // Refresh list
            } else {
                alert('Failed to add asset');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateAsset = async (asset: Asset, updates: any) => {
        try {
            const res = await fetch(`http://localhost:8000/api/assets/${asset.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...asset,
                    ...updates
                })
            });
            if (res.ok) {
                if (selectedEmployee) fetchEmployeeData(selectedEmployee.employee_code);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAsset = async (assetId: number) => {
        if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/api/assets/${assetId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                if (selectedEmployee) fetchEmployeeData(selectedEmployee.employee_code);
            } else {
                alert('Failed to delete asset');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting asset');
        }
    };

    // Filter employees for autocomplete
    const filteredEmployees = searchTerm
        ? employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.employee_code.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

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

            <main className="relative z-10 max-w-6xl mx-auto p-6 pt-32">

                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 transition">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Asset Management
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Selection & Issue */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. Employee Search */}
                        <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6 relative">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Search size={18} className="text-brand-purple" /> Find Employee
                            </h2>
                            <input
                                type="text"
                                placeholder="Search by Name or ID..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (e.target.value === '') setSelectedEmployee(null);
                                }}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white focus:border-brand-purple outline-none"
                            />
                            {/* Autocomplete Dropdown */}
                            {searchTerm && !selectedEmployee && filteredEmployees.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-20">
                                    {filteredEmployees.map(emp => (
                                        <div
                                            key={emp.employee_code}
                                            onClick={() => handleSelectEmployee(emp)}
                                            className="p-3 hover:bg-[#222] cursor-pointer border-b border-[#333] last:border-0"
                                        >
                                            <p className="font-bold text-white">{emp.name}</p>
                                            <p className="text-xs text-gray-500">{emp.employee_code} • {emp.designation}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Issue New Asset Form */}
                        {selectedEmployee && (
                            <form onSubmit={handleAddAsset} className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6 animate-fade-in-up">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Monitor size={18} className="text-brand-purple" /> Issue New Asset
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Employee</label>
                                        <p className="text-gray-300 font-mono">{selectedEmployee.name} ({selectedEmployee.employee_code})</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Asset ID (Tag)</label>
                                        <input
                                            type="text"
                                            value={newAsset.asset_id}
                                            onChange={e => setNewAsset({ ...newAsset, asset_id: e.target.value })}
                                            required
                                            placeholder="e.g. LAP-2024-001"
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">Issue Date</label>
                                        <input
                                            type="date"
                                            value={newAsset.issue_date}
                                            onChange={e => setNewAsset({ ...newAsset, issue_date: e.target.value })}
                                            required
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 mt-1 text-white focus:border-brand-purple outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-brand-purple text-white font-bold hover:bg-opacity-90 transition shadow-lg shadow-brand-purple/20"
                                    >
                                        Assign Asset
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Column: Asset List & Management */}
                    <div className="lg:col-span-8">
                        {selectedEmployee ? (
                            <div className="space-y-6">
                                {/* Master Checklist Section */}
                                <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-6 animate-fade-in-up">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle size={20} className="text-green-500" /> Master Clearance Checklist
                                    </h2>
                                    {employeeDetails && (
                                        <MasterChecklist
                                            details={employeeDetails}
                                            onUpdate={async (updates) => {
                                                const res = await fetch(`http://localhost:8000/api/employee/${employeeDetails.employee_code}`, {
                                                    method: 'PUT',
                                                    credentials: 'include',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(updates)
                                                });
                                                if (res.ok) fetchEmployeeData(employeeDetails.employee_code);
                                            }}
                                        />
                                    )}
                                </div>

                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-300">
                                    Assets for <span className="text-white">{selectedEmployee.name}</span>
                                </h2>

                                {loading && <p>Loading assets...</p>}

                                {!loading && assets.length === 0 && (
                                    <div className="p-8 border border-dashed border-[#333] rounded-3xl text-center text-gray-500">
                                        No assets assigned to this employee yet.
                                    </div>
                                )}

                                {assets.map(asset => (
                                    <AssetCard
                                        key={asset.id}
                                        asset={asset}
                                        onUpdate={(updates) => handleUpdateAsset(asset, updates)}
                                        onDelete={() => handleDeleteAsset(asset.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 bg-[#111]/50 border border-[#222] rounded-3xl min-h-[400px]">
                                Select an employee to view and manage their assets.
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

// Sub-component for Asset Item
function AssetCard({ asset, onUpdate, onDelete }: { asset: Asset, onUpdate: (data: any) => void, onDelete: () => void }) {
    const isReturned = !!asset.return_date;

    return (
        <div className={`bg-[#1a1a1a] border ${isReturned ? 'border-green-900/50' : 'border-[#333]'} rounded-2xl p-6 transition-all`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-white tracking-wide">{asset.asset_id}</span>
                        {isReturned && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900">RETURNED</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Issued: {asset.issue_date}</p>
                </div>

                {/* Return Date Input */}
                <div className="flex flex-col items-end gap-2">
                    <label className="text-xs text-gray-500 uppercase">Return Date</label>
                    <input
                        type="date"
                        value={asset.return_date || ''}
                        onChange={(e) => onUpdate({ return_date: e.target.value })}
                        className="bg-[#111] border border-[#333] text-gray-300 text-xs rounded px-2 py-1 focus:border-brand-purple outline-none"
                    />
                </div>
            </div>

            {/* Delete Button */}
            <div className="flex justify-end pt-4 border-t border-[#222]">
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} />
                    Delete Asset
                </button>
            </div>

        </div>
    );
}

function MasterChecklist({ details, onUpdate }: { details: EmployeeDetails, onUpdate: (u: any) => void }) {

    const renderToggle = (label: string, field: keyof EmployeeDetails, checkedText: string, uncheckedText: string, checkedClass: string, uncheckedClass: string) => {
        const isChecked = !!details[field];
        return (
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333] flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                <button
                    onClick={() => onUpdate({ [field]: isChecked ? 0 : 1 })}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold border transition-all ${isChecked ? checkedClass : uncheckedClass
                        }`}
                >
                    {isChecked ? checkedText : uncheckedText}
                    <div className={`w-2 h-2 rounded-full ${isChecked ? 'bg-current shadow-[0_0_8px_currentColor]' : 'bg-current'}`} />
                </button>
            </div>
        );
    };

    // Styles
    const redStyle = "bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-900/30";
    const greenStyle = "bg-green-900/20 text-green-500 border-green-900/50 hover:bg-green-900/30";

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Standard Logic: Checked(1)=Yes(Green), Unchecked(0)=No(Red) */}

            {/* Bag */}
            {renderToggle('Bag', 'checklist_bag', 'Yes', 'No', greenStyle, redStyle)}

            {/* Email Access */}
            {renderToggle('Email Access', 'checklist_email_access', 'Yes', 'No', greenStyle, redStyle)}

            {/* Groups */}
            {renderToggle('Groups', 'checklist_groups', 'Yes', 'No', greenStyle, redStyle)}

            {/* Relieving Letter */}
            {renderToggle('Relieving Letter', 'checklist_relieving_letter', 'Yes', 'No', greenStyle, redStyle)}
        </div>
    );
}


