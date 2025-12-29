'use client';

import {
    Info, Book, Users, Laptop, TrendingUp, GraduationCap, ArrowRight, ShieldCheck,
    FileText, Search, Edit, Trash2, Plus, Target, Calendar, CheckCircle, BarChart,
    Settings, Database, Lock, UserPlus, Download, Upload, Eye, AlertCircle
} from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/menu';

export default function AboutPage() {
    const { user } = useAuth();
    const menuItems = user ? getMenuItems(user.role) : [];

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

            <main className="relative z-10 max-w-6xl mx-auto p-6 pt-32 animate-fade-in-up pb-20">

                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-purple to-white mb-6">
                        EwandzDigital HRMS
                    </h1>
                    <p className="text-2xl text-gray-400 max-w-3xl mx-auto mb-4">
                        Complete Human Resource Management System
                    </p>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Streamline employee data, asset tracking, performance reviews, training programs, and comprehensive analytics—all in one powerful platform.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                    <div className="bg-[#111]/80 backdrop-blur-md border border-brand-purple/30 rounded-2xl p-6 text-center">
                        <Database className="mx-auto mb-2 text-brand-purple" size={32} />
                        <div className="text-3xl font-bold text-white">8+</div>
                        <div className="text-sm text-gray-400">Core Modules</div>
                    </div>
                    <div className="bg-[#111]/80 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-center">
                        <BarChart className="mx-auto mb-2 text-blue-400" size={32} />
                        <div className="text-3xl font-bold text-white">10+</div>
                        <div className="text-sm text-gray-400">Analytics Charts</div>
                    </div>
                    <div className="bg-[#111]/80 backdrop-blur-md border border-green-500/30 rounded-2xl p-6 text-center">
                        <ShieldCheck className="mx-auto mb-2 text-green-400" size={32} />
                        <div className="text-3xl font-bold text-white">100%</div>
                        <div className="text-sm text-gray-400">Secure</div>
                    </div>
                    <div className="bg-[#111]/80 backdrop-blur-md border border-pink-500/30 rounded-2xl p-6 text-center">
                        <Users className="mx-auto mb-2 text-pink-400" size={32} />
                        <div className="text-3xl font-bold text-white">∞</div>
                        <div className="text-sm text-gray-400">Employees</div>
                    </div>
                </div>

                {/* About Software */}
                <section className="mb-20">
                    <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 border-b border-[#333] pb-4">
                        <Info className="text-brand-purple" size={40} /> About The System
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8 hover:border-brand-purple/50 transition-all">
                            <h3 className="text-2xl font-bold mb-4 text-white">Why Use This HRMS?</h3>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                Managing a growing workforce requires precision and efficiency. This software centralizes all employee operations into one intuitive interface, reducing administrative overhead and ensuring data accuracy across departments.
                            </p>
                            <p className="text-gray-400 leading-relaxed">
                                From onboarding to exit management, performance tracking to skill development, everything is tracked securely with real-time analytics and comprehensive reporting capabilities.
                            </p>
                        </div>
                        <div className="bg-[#111]/80 backdrop-blur-md border border-[#222] rounded-3xl p-8 hover:border-brand-purple/50 transition-all">
                            <h3 className="text-2xl font-bold mb-4 text-white">Core Capabilities</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> Cookie-based Authentication & Route Protection</li>
                                <li className="flex items-center gap-2"><Database size={18} className="text-blue-500" /> Centralized SQLite Database</li>
                                <li className="flex items-center gap-2"><Users size={18} className="text-purple-500" /> Complete Employee Lifecycle Management</li>
                                <li className="flex items-center gap-2"><Laptop size={18} className="text-cyan-500" /> Real-time Asset Tracking & Inventory</li>
                                <li className="flex items-center gap-2"><TrendingUp size={18} className="text-pink-500" /> KRA-based Performance Management</li>
                                <li className="flex items-center gap-2"><GraduationCap size={18} className="text-orange-500" /> Training Library & Assignment System</li>
                                <li className="flex items-center gap-2"><BarChart size={18} className="text-yellow-500" /> Advanced Analytics Dashboard</li>
                            </ul>
                        </div>
                    </div>

                    {/* Technical Stack */}
                    <div className="bg-gradient-to-br from-brand-purple/10 to-transparent border border-brand-purple/30 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <Settings size={24} className="text-brand-purple" /> Technical Stack
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-bold text-brand-purple mb-3">Frontend</h4>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li>• Next.js 16 (App Router)</li>
                                    <li>• React 19 with TypeScript</li>
                                    <li>• Tailwind CSS for styling</li>
                                    <li>• Recharts for data visualization</li>
                                    <li>• Lucide React for icons</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-400 mb-3">Backend</h4>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li>• FastAPI (Python)</li>
                                    <li>• SQLite3 Database</li>
                                    <li>• RESTful API Architecture</li>
                                    <li>• Pandas for data processing</li>
                                    <li>• Uvicorn ASGI server</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-green-400 mb-3">Features</h4>
                                <ul className="space-y-2 text-gray-400 text-sm">
                                    <li>• Cookie-based auth</li>
                                    <li>• Middleware route protection</li>
                                    <li>• Auto-logout on idle (15 min)</li>
                                    <li>• File upload support</li>
                                    <li>• Real-time data sync</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comprehensive User Guide */}
                <section>
                    <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 border-b border-[#333] pb-4">
                        <Book className="text-brand-purple" size={40} /> Complete User Guide
                    </h2>

                    <div className="space-y-16">
                        {/* Module 1: Dashboard */}
                        <div className="bg-[#111]/50 border border-[#222] rounded-3xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-brand-purple/20 to-transparent rounded-2xl border border-brand-purple/30">
                                    <BarChart size={48} className="text-brand-purple" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">Dashboard & Analytics</h3>
                                    <p className="text-gray-400">Real-time insights and comprehensive metrics</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-brand-purple mb-3 flex items-center gap-2">
                                        <Eye size={20} /> Overview
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        The Dashboard is your command center, providing instant visibility into your organization's HR metrics. Access it immediately after login to see real-time statistics and trends.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-brand-purple mb-3">Key Metrics Displayed</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                            <h5 className="font-bold text-white mb-2">📊 Statistics Cards</h5>
                                            <ul className="text-sm text-gray-400 space-y-1">
                                                <li>• Total Employees</li>
                                                <li>• Active Teams Count</li>
                                                <li>• Active Employees</li>
                                                <li>• Total Designations</li>
                                                <li>• Average Tenure (years)</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                            <h5 className="font-bold text-white mb-2">📈 Charts & Visualizations</h5>
                                            <ul className="text-sm text-gray-400 space-y-1">
                                                <li>• Team Distribution (Bar Chart)</li>
                                                <li>• Employment Status (Pie Chart)</li>
                                                <li>• Hiring Trend by Year (Line Chart)</li>
                                                <li>• Top Skills (Horizontal Bar)</li>
                                                <li>• Asset Inventory (Pie Chart)</li>
                                                <li>• Experience Distribution (Bar Chart)</li>
                                                <li>• Tenure Distribution (Bar Chart)</li>
                                                <li>• Location Distribution (Bar Chart)</li>
                                                <li>• Recent Hires Table (Top 5)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4">
                                    <p className="text-sm text-blue-300 flex items-start gap-2">
                                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                        <span><strong>Tip:</strong> All charts are interactive and update in real-time as you add or modify employee data. The dashboard automatically refreshes data from the backend API.</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Module 2: Employee Management */}
                        <div className="bg-[#111]/50 border border-[#222] rounded-3xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-purple-900/20 to-transparent rounded-2xl border border-purple-500/30">
                                    <Users size={48} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">Employee Management</h3>
                                    <p className="text-gray-400">Complete employee lifecycle from hire to exit</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                                        <UserPlus size={20} /> Adding New Employees
                                    </h4>
                                    <ol className="space-y-3 text-gray-300">
                                        <li className="flex gap-3">
                                            <span className="font-bold text-brand-purple">1.</span>
                                            <div>
                                                <strong>Navigate:</strong> Click "Add Employee" in the navigation menu.
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-brand-purple">2.</span>
                                            <div>
                                                <strong>Basic Information:</strong> Fill in required fields:
                                                <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-400">
                                                    <li>• Employee Code (unique identifier)</li>
                                                    <li>• Full Name</li>
                                                    <li>• Email Address</li>
                                                    <li>• Phone Number</li>
                                                    <li>• Date of Birth</li>
                                                    <li>• Date of Joining</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-brand-purple">3.</span>
                                            <div>
                                                <strong>Work Details:</strong> Specify:
                                                <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-400">
                                                    <li>• Team/Department</li>
                                                    <li>• Designation/Role</li>
                                                    <li>• Reporting Manager</li>
                                                    <li>• Employment Type (Full-time, Contract, Intern)</li>
                                                    <li>• Location/Office</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-brand-purple">4.</span>
                                            <div>
                                                <strong>Documents:</strong> Upload (optional):
                                                <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-400">
                                                    <li>• Profile Photo</li>
                                                    <li>• Resume/CV (PDF)</li>
                                                    <li>• ID Proofs</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-brand-purple">5.</span>
                                            <div>
                                                <strong>Submit:</strong> Click "Add Employee" button. The system will create the employee record and redirect you to the directory.
                                            </div>
                                        </li>
                                    </ol>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                                        <Search size={20} /> Employee Directory
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        The Directory provides a searchable, filterable view of all employees with quick access to profiles.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-3">Features:</h5>
                                        <ul className="space-y-2 text-gray-400">
                                            <li className="flex items-start gap-2">
                                                <Search size={16} className="mt-1 text-purple-400 flex-shrink-0" />
                                                <span><strong>Real-time Search:</strong> Type employee name or code to instantly filter results</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Users size={16} className="mt-1 text-purple-400 flex-shrink-0" />
                                                <span><strong>Team Filter:</strong> Filter by department/team using dropdown</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Eye size={16} className="mt-1 text-purple-400 flex-shrink-0" />
                                                <span><strong>Status Badges:</strong> Visual indicators for Active/Exited employees</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ArrowRight size={16} className="mt-1 text-purple-400 flex-shrink-0" />
                                                <span><strong>Quick Access:</strong> Click any card to view full employee profile</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                                        <FileText size={20} /> Employee Profile
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        The profile page is a comprehensive view of all employee data, organized in tabs for easy navigation.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                            <h5 className="font-bold text-white mb-2">📋 Overview Tab</h5>
                                            <ul className="text-sm text-gray-400 space-y-1">
                                                <li>• Personal Information</li>
                                                <li>• Contact Details</li>
                                                <li>• Emergency Contacts</li>
                                                <li>• Address Information</li>
                                                <li>• Employment Details</li>
                                                <li>• Exit Information (if applicable)</li>
                                                <li>• Master Clearance Checklist</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                            <h5 className="font-bold text-white mb-2">💼 Assets Tab</h5>
                                            <ul className="text-sm text-gray-400 space-y-1">
                                                <li>• Assigned Equipment List</li>
                                                <li>• Asset IDs & Issue Dates</li>
                                                <li>• Return Status</li>
                                                <li>• Historical Asset Records</li>
                                            </ul>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                            <h5 className="font-bold text-white mb-2">📊 Performance Tab</h5>
                                            <ul className="text-sm text-gray-400 space-y-1">
                                                <li>• Skill Matrix & Expertise</li>
                                                <li>• Experience Years</li>
                                                <li>• Primary & Secondary Skills</li>
                                                <li>• Performance Reviews</li>
                                                <li>• Manager Feedback</li>
                                                <li>• HR Activity & Training</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                                        <Edit size={20} /> Editing Employee Data
                                    </h4>
                                    <p className="text-gray-300 mb-3">
                                        Employee information can be updated directly from their profile page.
                                    </p>
                                    <ol className="space-y-2 text-gray-400">
                                        <li>1. Navigate to the employee's profile</li>
                                        <li>2. Click the "Edit" button (if available) or modify fields directly</li>
                                        <li>3. Update any field (name, designation, team, status, etc.)</li>
                                        <li>4. Changes are saved automatically or via "Save" button</li>
                                        <li>5. System validates data before saving</li>
                                    </ol>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                                        <Trash2 size={20} /> Deleting Employees
                                    </h4>
                                    <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4">
                                        <p className="text-gray-300 mb-3">
                                            <strong className="text-red-400">⚠️ Danger Zone:</strong> Located at the bottom of each employee profile.
                                        </p>
                                        <ol className="space-y-2 text-gray-400 text-sm">
                                            <li>1. Scroll to the bottom of the employee profile</li>
                                            <li>2. Click the red "Delete Employee" button</li>
                                            <li>3. Confirm deletion in the popup dialog</li>
                                            <li>4. System will permanently remove:
                                                <ul className="ml-6 mt-1 space-y-1">
                                                    <li>• Employee profile & personal data</li>
                                                    <li>• Skill matrix records</li>
                                                    <li>• Asset assignments</li>
                                                    <li>• Performance reviews</li>
                                                    <li>• Training records</li>
                                                </ul>
                                            </li>
                                            <li className="text-red-400 font-bold">⚠️ This action cannot be undone!</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Module 3: Asset Management */}
                        <div className="bg-[#111]/50 border border-[#222] rounded-3xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-blue-900/20 to-transparent rounded-2xl border border-blue-500/30">
                                    <Laptop size={48} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">Asset Tracking & Management</h3>
                                    <p className="text-gray-400">Track equipment, laptops, and company property</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                                        <Plus size={20} /> Assigning Assets
                                    </h4>
                                    <ol className="space-y-3 text-gray-300">
                                        <li className="flex gap-3">
                                            <span className="font-bold text-blue-400">1.</span>
                                            <div>
                                                <strong>Navigate:</strong> Go to "Assets" in the main menu
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-blue-400">2.</span>
                                            <div>
                                                <strong>Select Employee:</strong> Use the search bar to find and select the employee
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-blue-400">3.</span>
                                            <div>
                                                <strong>Enter Asset Details:</strong>
                                                <ul className="ml-4 mt-2 space-y-1 text-sm text-gray-400">
                                                    <li>• Asset ID (e.g., LAP-001, MON-042)</li>
                                                    <li>• Issue Date</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-bold text-blue-400">4.</span>
                                            <div>
                                                <strong>Submit:</strong> Click "Assign Asset" - the asset is now tracked under that employee
                                            </div>
                                        </li>
                                    </ol>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                                        <CheckCircle size={20} /> Marking Assets as Returned
                                    </h4>
                                    <p className="text-gray-300 mb-3">
                                        When an employee returns equipment (during exit or device change):
                                    </p>
                                    <ol className="space-y-2 text-gray-400">
                                        <li>1. Go to "Assets" and select the employee</li>
                                        <li>2. Find the asset in their list</li>
                                        <li>3. Enter the "Return Date" in the date field</li>
                                        <li>4. The asset status automatically updates to "RETURNED"</li>
                                        <li>5. Dashboard charts reflect the change immediately</li>
                                    </ol>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                                        <CheckCircle size={20} /> Master Clearance Checklist
                                    </h4>
                                    <p className="text-gray-300 mb-3">
                                        Track exit formalities for departing employees:
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-3">Checklist Items:</h5>
                                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-400" />
                                                <span>Bag Returned</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-400" />
                                                <span>Email Access Revoked</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-400" />
                                                <span>Groups Removed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={14} className="text-green-400" />
                                                <span>Relieving Letter Issued</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-3">
                                            Toggle each item as Yes/No. Green = Completed, Red = Pending
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                                        <Trash2 size={20} /> Deleting Assets
                                    </h4>
                                    <p className="text-gray-300 mb-3">
                                        Remove asset records (e.g., if assigned by mistake):
                                    </p>
                                    <ol className="space-y-2 text-gray-400">
                                        <li>1. Navigate to the employee's asset list</li>
                                        <li>2. Find the asset card</li>
                                        <li>3. Click the red "Delete Asset" button at the bottom</li>
                                        <li>4. Confirm deletion in the popup</li>
                                        <li>5. Asset record is permanently removed</li>
                                    </ol>
                                </div>

                                <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4">
                                    <p className="text-sm text-blue-300 flex items-start gap-2">
                                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                        <span><strong>Dashboard Integration:</strong> The Dashboard's "Asset Inventory" chart automatically shows the ratio of Assigned vs. Returned assets across your organization.</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Module 4: Performance Management */}
                        <div className="bg-[#111]/50 border border-[#222] rounded-3xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-green-900/20 to-transparent rounded-2xl border border-green-500/30">
                                    <TrendingUp size={48} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">Performance & KRA Management</h3>
                                    <p className="text-gray-400">Goal setting, tracking, and performance reviews</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-green-400 mb-3">Understanding KRAs</h4>
                                    <p className="text-gray-300 mb-3">
                                        <strong>KRA (Key Result Area)</strong> is a measurable goal or objective assigned to employees. Examples: "Sales Target Achievement", "Code Quality", "Customer Satisfaction Score".
                                    </p>
                                    <p className="text-gray-400">
                                        The Performance module has 3 tabs: <strong>Library</strong>, <strong>Groups</strong>, and <strong>Assign</strong>.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                                        <Book size={20} /> Tab 1: KRA Library
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        Create reusable KRA templates that can be assigned to multiple employees.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] mb-4">
                                        <h5 className="font-bold text-white mb-3">Creating a KRA:</h5>
                                        <ol className="space-y-2 text-gray-400 text-sm">
                                            <li>1. Navigate to Performance → Library tab</li>
                                            <li>2. Fill in the form on the right:
                                                <ul className="ml-6 mt-1 space-y-1">
                                                    <li>• <strong>KRA Name:</strong> e.g., "Monthly Sales Target"</li>
                                                    <li>• <strong>Goal Name:</strong> e.g., "Achieve ₹10L revenue"</li>
                                                    <li>• <strong>Weightage:</strong> % importance (e.g., 30%)</li>
                                                    <li>• <strong>Description:</strong> Detailed criteria</li>
                                                </ul>
                                            </li>
                                            <li>3. Click "Save KRA"</li>
                                            <li>4. KRA appears in the library list on the left</li>
                                        </ol>
                                    </div>
                                    <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4">
                                        <h5 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                                            <Trash2 size={16} /> Deleting KRAs
                                        </h5>
                                        <p className="text-sm text-gray-400">
                                            Each KRA card has a red trash icon. Click it to delete. <strong>Warning:</strong> This also removes all assignments of that KRA to employees.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                                        <Users size={20} /> Tab 2: Employee Groups
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        Create custom groups for bulk KRA assignment (e.g., "Q1 2025 Interns", "Sales Team").
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] mb-4">
                                        <h5 className="font-bold text-white mb-3">Creating a Group:</h5>
                                        <ol className="space-y-2 text-gray-400 text-sm">
                                            <li>1. Go to Performance → Groups tab</li>
                                            <li>2. Enter Group Name (e.g., "Marketing Team 2025")</li>
                                            <li>3. Select members from the employee list (click to toggle)</li>
                                            <li>4. Click "Create Group"</li>
                                            <li>5. Group appears on the right with member count</li>
                                        </ol>
                                    </div>
                                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                                        <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            <Edit size={16} /> Managing Group Members
                                        </h5>
                                        <p className="text-sm text-gray-300 mb-3">
                                            Click on any existing group card to open the member management dialog.
                                        </p>
                                        <ul className="space-y-2 text-sm text-gray-400">
                                            <li>• <strong>Left Panel:</strong> Current members - click "Remove" to mark for removal</li>
                                            <li>• <strong>Right Panel:</strong> Available employees - click "Add" to mark for addition</li>
                                            <li>• Changes are highlighted (green for add, red for remove)</li>
                                            <li>• Click "Update Group" to save changes</li>
                                            <li>• Button shows count: e.g., "Update Group (+2 -1)"</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4">
                                        <h5 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                                            <Trash2 size={16} /> Deleting Groups
                                        </h5>
                                        <p className="text-sm text-gray-400">
                                            In the group member dialog, click the red "Delete Group" button (bottom left). Confirms before deletion. Removes group and all member associations.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                                        <Target size={20} /> Tab 3: Assign KRAs
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        Assign KRAs from the library to individuals, teams, or groups.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-3">Assignment Process:</h5>
                                        <ol className="space-y-3 text-gray-400 text-sm">
                                            <li className="flex gap-3">
                                                <span className="font-bold text-green-400">1.</span>
                                                <div>
                                                    <strong>Choose Target Type:</strong>
                                                    <ul className="ml-4 mt-1 space-y-1">
                                                        <li>• <strong>Individual:</strong> Assign to one employee</li>
                                                        <li>• <strong>Team:</strong> Assign to all members of a department</li>
                                                        <li>• <strong>Group:</strong> Assign to a custom group</li>
                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-bold text-green-400">2.</span>
                                                <div>
                                                    <strong>Select Target:</strong> Choose specific employee/team/group from dropdown
                                                </div>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-bold text-green-400">3.</span>
                                                <div>
                                                    <strong>Review Period:</strong> Enter period (e.g., "Q1 2025", "Jan-Mar 2025")
                                                </div>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-bold text-green-400">4.</span>
                                                <div>
                                                    <strong>Select KRAs:</strong> Click on KRA cards to select (green highlight = selected)
                                                </div>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-bold text-green-400">5.</span>
                                                <div>
                                                    <strong>Assign:</strong> Click "Assign KRAs" button
                                                </div>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="font-bold text-green-400">6.</span>
                                                <div>
                                                    <strong>Confirmation:</strong> Success message shows how many KRAs were assigned to how many employees
                                                </div>
                                            </li>
                                        </ol>
                                    </div>
                                </div>

                                <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-4">
                                    <p className="text-sm text-green-300 flex items-start gap-2">
                                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                        <span><strong>Example Use Case:</strong> Create KRAs like "Code Review Quality" and "Sprint Completion Rate" in the Library. Create a group "Backend Developers". Assign both KRAs to this group for "Q1 2025". All backend developers now have these 2 KRAs tracked.</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Module 5: Training Management */}
                        <div className="bg-[#111]/50 border border-[#222] rounded-3xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-pink-900/20 to-transparent rounded-2xl border border-pink-500/30">
                                    <GraduationCap size={48} className="text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">Training & Development</h3>
                                    <p className="text-gray-400">Skill development and training program management</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-pink-400 mb-3">Overview</h4>
                                    <p className="text-gray-300 mb-3">
                                        The Training module helps you create reusable training programs and assign them to employees. It has 3 tabs: <strong>Overview</strong>, <strong>Library</strong>, and <strong>Assign</strong>.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2">
                                        <Book size={20} /> Tab 1: Training Library
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        Create reusable training program templates.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-3">Creating a Training Program:</h5>
                                        <ol className="space-y-2 text-gray-400 text-sm">
                                            <li>1. Go to Training → Library tab</li>
                                            <li>2. Fill in the form:
                                                <ul className="ml-6 mt-1 space-y-1">
                                                    <li>• <strong>Program Name:</strong> e.g., "Fire Safety Training"</li>
                                                    <li>• <strong>Description:</strong> What the training covers</li>
                                                    <li>• <strong>Default Duration:</strong> e.g., "2 hours", "3 days"</li>
                                                </ul>
                                            </li>
                                            <li>3. Click "Create Program"</li>
                                            <li>4. Program appears in the library list</li>
                                        </ol>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2">
                                        <Target size={20} /> Tab 2: Assign Training
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        Assign training programs to one or more employees.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-3">Assignment Process:</h5>
                                        <ol className="space-y-2 text-gray-400 text-sm">
                                            <li>1. Select a program from the dropdown</li>
                                            <li>2. Choose training date</li>
                                            <li>3. Enter duration (can override default)</li>
                                            <li>4. Select employees (multi-select checkboxes)</li>
                                            <li>5. Click "Assign Training"</li>
                                            <li>6. Training is assigned with status "Pending"</li>
                                        </ol>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2">
                                        <CheckCircle size={20} /> Tab 3: Overview & Status Updates
                                    </h4>
                                    <p className="text-gray-300 mb-4">
                                        View all training assignments and update their status.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-3">Features:</h5>
                                        <ul className="space-y-2 text-gray-400 text-sm">
                                            <li>• <strong>Search Bar:</strong> Filter by employee name or training program</li>
                                            <li>• <strong>Assignment Table:</strong> Shows all assignments with:
                                                <ul className="ml-6 mt-1 space-y-1">
                                                    <li>- Employee Name</li>
                                                    <li>- Training Program</li>
                                                    <li>- Date & Duration</li>
                                                    <li>- Current Status (Pending/Completed)</li>
                                                </ul>
                                            </li>
                                            <li>• <strong>Status Update:</strong> Click the status dropdown to change from "Pending" to "Completed"</li>
                                            <li>• <strong>Color Coding:</strong> Blue = Pending, Green = Completed</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-pink-900/10 border border-pink-500/30 rounded-xl p-4">
                                    <p className="text-sm text-pink-300 flex items-start gap-2">
                                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                        <span><strong>Integration:</strong> All training records are also visible in the employee's profile under the "Performance" tab → "HR Activity" section.</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Module 6: Authentication & Security */}
                        <div className="bg-[#111]/50 border border-[#222] rounded-3xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-red-900/20 to-transparent rounded-2xl border border-red-500/30">
                                    <Lock size={48} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white">Security & Authentication</h3>
                                    <p className="text-gray-400">Login, logout, and session management</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-bold text-red-400 mb-3">Login Process</h4>
                                    <ol className="space-y-2 text-gray-300">
                                        <li>1. Navigate to the application URL</li>
                                        <li>2. Enter your username and password</li>
                                        <li>3. Click "Sign In"</li>
                                        <li>4. System sets authentication cookie (expires in 1 day)</li>
                                        <li>5. Redirects to Dashboard</li>
                                    </ol>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-red-400 mb-3">Route Protection</h4>
                                    <p className="text-gray-300 mb-3">
                                        All pages except the login page are protected by middleware. If you try to access any page without being logged in, you'll be automatically redirected to the login page.
                                    </p>
                                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                                        <h5 className="font-bold text-white mb-2">Protected Routes:</h5>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            <li>• /dashboard</li>
                                            <li>• /employee-directory</li>
                                            <li>• /add-employee</li>
                                            <li>• /employee-profile/*</li>
                                            <li>• /manage-assets</li>
                                            <li>• /performance</li>
                                            <li>• /training</li>
                                            <li>• /about</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-red-400 mb-3">Auto-Logout on Idle</h4>
                                    <p className="text-gray-300 mb-3">
                                        The system automatically logs you out after <strong>15 minutes of inactivity</strong> to protect sensitive data.
                                    </p>
                                    <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-xl p-4">
                                        <p className="text-sm text-yellow-300 flex items-start gap-2">
                                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                            <span><strong>Activity Detection:</strong> Mouse movement, clicks, keyboard input, scrolling, and touch events reset the idle timer.</span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-red-400 mb-3">Manual Logout</h4>
                                    <ol className="space-y-2 text-gray-300">
                                        <li>1. Click the menu button (top right)</li>
                                        <li>2. Click "Logout" in the navigation menu</li>
                                        <li>3. System clears authentication cookie and session data</li>
                                        <li>4. Redirects to login page</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips & Best Practices */}
                <section className="mt-20">
                    <h2 className="text-4xl font-bold mb-10 flex items-center gap-3 border-b border-[#333] pb-4">
                        <AlertCircle className="text-brand-purple" size={40} /> Tips & Best Practices
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6">
                            <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                                <CheckCircle size={20} /> Data Entry
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Use consistent naming conventions for teams and designations</li>
                                <li>• Always fill in employee codes (they're unique identifiers)</li>
                                <li>• Upload photos and CVs during onboarding for complete records</li>
                                <li>• Keep skill matrices updated for accurate analytics</li>
                            </ul>
                        </div>
                        <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6">
                            <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                                <Target size={20} /> Asset Management
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Use clear asset IDs (e.g., LAP-001, MON-042)</li>
                                <li>• Always record issue dates</li>
                                <li>• Mark assets as returned immediately upon collection</li>
                                <li>• Complete exit checklists before final clearance</li>
                            </ul>
                        </div>
                        <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-6">
                            <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                                <TrendingUp size={20} /> Performance Reviews
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Create KRAs at the start of each quarter</li>
                                <li>• Use groups for bulk assignments to save time</li>
                                <li>• Assign appropriate weightages (total should be 100%)</li>
                                <li>• Review and update KRA assignments quarterly</li>
                            </ul>
                        </div>
                        <div className="bg-pink-900/10 border border-pink-500/30 rounded-xl p-6">
                            <h3 className="font-bold text-pink-400 mb-3 flex items-center gap-2">
                                <GraduationCap size={20} /> Training Programs
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Create programs in the library for reusability</li>
                                <li>• Assign training well in advance of the date</li>
                                <li>• Update status to "Completed" promptly</li>
                                <li>• Use the Overview tab to track completion rates</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-[#222] text-center">
                    <p className="text-gray-500 mb-2">© 2024 EwandzDigital HRMS. All rights reserved.</p>
                    <p className="text-sm text-gray-600">Built with Next.js, FastAPI, and SQLite</p>
                </div>

            </main>
        </div>
    );
}
