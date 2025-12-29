'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Briefcase, FileText, Upload, Save, MapPin } from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

export default function AddEmployee() {
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



    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        code: '', name: '', dob: '', phone: '', emergency: '', email: '',
        current_address: '', permanent_address: '', location: '',
        doj: '', team: '', role: '', type: 'Full Time', manager: '',
        pf: 'No', mediclaim: 'No', notes: '',
        primary_skillset: '', secondary_skillset: '', experience_years: ''
    });

    const [files, setFiles] = useState<{
        photo: File | null;
        cv: File | null;
        id_proof: File | null;
    }>({
        photo: null, cv: null, id_proof: null
    });

    if (!isAuthorized) return null;

    const menuItems = getMenuItems(user?.role);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'cv' | 'id_proof') => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Basic Client Validation
        if (!formData.code.startsWith('EMP')) {
            setMessage({ type: 'error', text: 'Employee Code must start with "EMP".' });
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            if (files.photo) data.append('photo_file', files.photo);
            if (files.cv) data.append('cv_file', files.cv);
            if (files.id_proof) data.append('id_proof_file', files.id_proof);

            const res = await fetch('http://localhost:8000/api/employee', {
                method: 'POST',
                credentials: 'include',
                body: data // FormData handles headers
            });

            const result = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Employee added successfully!' });
                setTimeout(() => router.push('/employee-directory'), 2000);
            } else {
                setMessage({ type: 'error', text: result.detail || 'Failed to add employee' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
            <Waves
                lineColor="#230a46ff"
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

            <main className="mx-auto max-w-5xl p-6 pt-32 relative z-10 animate-fade-in-up">

                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Add New Employee
                    </h1>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-red-900/30 text-red-300 border border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Section 1: Personal Details */}
                    <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white border-b border-[#222] pb-4">
                            <User className="text-brand-purple" size={20} /> Personal Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField label="Employee Code (e.g. EMP001)" name="code" value={formData.code} onChange={handleChange} required placeholder="EMP..." />
                            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                            <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            <InputField label="Phone Number (10 digits)" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
                            <InputField label="Emergency Contact" name="emergency" value={formData.emergency} onChange={handleChange} required placeholder="9876543210" />

                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextAreaField label="Current Address" name="current_address" value={formData.current_address} onChange={handleChange} />
                                <TextAreaField label="Permanent Address" name="permanent_address" value={formData.permanent_address} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Employment Details */}
                    <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white border-b border-[#222] pb-4">
                            <Briefcase className="text-blue-500" size={20} /> Employment Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField label="Team / Dept" name="team" value={formData.team} onChange={handleChange} required />
                            <InputField label="Designation" name="role" value={formData.role} onChange={handleChange} required />
                            <InputField label="Reporting Manager" name="manager" value={formData.manager} onChange={handleChange} required />
                            <InputField label="Date of Joining" name="doj" type="date" value={formData.doj} onChange={handleChange} required />
                            <InputField label="Office Location" name="location" value={formData.location} onChange={handleChange} />

                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Employment Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-purple transition-colors"
                                >
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contractual">Contractual</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            <SelectField label="PF Included?" name="pf" value={formData.pf} onChange={handleChange} options={['Yes', 'No']} />
                            <SelectField label="Mediclaim Included?" name="mediclaim" value={formData.mediclaim} onChange={handleChange} options={['Yes', 'No']} />
                        </div>
                        <div className="mt-6">
                            <TextAreaField label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Section 3: Skills & Documents */}
                    <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white border-b border-[#222] pb-4">
                            <FileText className="text-yellow-500" size={20} /> Skills & Documents
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InputField label="Primary Skills" name="primary_skillset" value={formData.primary_skillset} onChange={handleChange} />
                            <InputField label="Secondary Skills" name="secondary_skillset" value={formData.secondary_skillset} onChange={handleChange} />
                            <InputField label="Years Experience" name="experience_years" type="number" step="0.1" value={formData.experience_years} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FileUpload label="Profile Photo" file={files.photo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'photo')} />
                            <FileUpload label="Resume / CV" file={files.cv} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'cv')} />
                            <FileUpload label="ID Proofs" file={files.id_proof} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'id_proof')} />
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-4 pt-4 pb-20">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl bg-transparent border border-[#333] text-gray-400 hover:text-white hover:border-gray-500 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 rounded-xl bg-brand-purple text-white font-bold shadow-lg shadow-brand-purple/20 hover:bg-opacity-90 transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}

// Helper Components
const InputField = ({ label, name, type = 'text', value, onChange, placeholder, step, required }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500 uppercase tracking-wider">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            step={step}
            required={required}
            className="bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-purple transition-colors placeholder-gray-700"
        />
    </div>
);

const TextAreaField = ({ label, name, value, onChange }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            className="bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-purple transition-colors h-24 resize-none"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="bg-[#1a1a1a] border border-[#333] text-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-purple transition-colors"
        >
            {options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const FileUpload = ({ label, onChange, file }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
        <div className="relative group">
            <input
                type="file"
                onChange={onChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`bg-[#1a1a1a] border border-[#333] border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 group-hover:border-brand-purple transition-colors ${file ? 'text-brand-purple border-brand-purple/50' : 'text-gray-400 group-hover:text-brand-purple'}`}>
                {file ? <FileText size={20} /> : <Upload size={20} />}
                <span className="text-xs text-center truncate w-full px-2">{file ? file.name : 'Click to upload'}</span>
            </div>
        </div>
    </div>
);
