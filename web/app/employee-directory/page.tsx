'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, User } from 'lucide-react';
import StaggeredMenu from '../../components/navBar';
import Waves from '../../components/Background/Waves';

interface Employee {
    employee_code: string;
    name: string;
    designation: string;
    team: string;
    email_id: string;
    photo_path: string | null;
}

const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/dashboard' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Services', ariaLabel: 'View our services', link: '/services' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
];

export default function EmployeeDirectory() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Check Auth
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(storedUser));

        // Fetch Data
        fetchEmployees();
    }, [router]);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        router.push('/');
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_code.toLowerCase().includes(search.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-brand-black">
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
            {/* --- TOP NAVIGATION BAR --- */}
            <StaggeredMenu
                position="right"
                isFixed={true}
                items={menuItems}
                // socialItems={socialItems}
                // displaySocials={true}
                displayItemNumbering={true}
                menuButtonColor="#fff"
                openMenuButtonColor="#fff"
                changeMenuColorOnOpen={true}
                colors={['#B19EEF', '#5227FF']}
                logoUrl="/logo.png"
                accentColor="var(--color-brand-purple)"
                onMenuOpen={() => console.log('Menu opened')}
                onMenuClose={() => console.log('Menu closed')}
                menuBackgroundColor="#000000ff"
                itemTextColor="#ffffff"
                smartHeader={true}
                headerColor="#000000ff"
            />

            {/* --- MAIN PAGE CONTENT --- */}
            <main className="mx-auto max-w-7xl p-6 pt-32 relative z-10">

                {/* Page Header & Search Bar */}
                {/* <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border-color bg-input-bg py-2 pl-10 pr-4 focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple sm:w-80 text-white placeholder-gray-500 transition-all"
                        />
                    </div>
                </div> */}

                {/* Loading State or Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading directory...</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {/* Loop through each employee to create a card */}
                        {filtered.map((emp) => (
                            <div key={emp.employee_code} className="group overflow-hidden rounded-xl bg-card-bg shadow-lg transition hover:shadow-2xl hover:shadow-brand-purple/20 border border-border-color hover:border-brand-purple/50">

                                {/* Card Banner (Top Color Splash) */}
                                <div className="h-24 bg-gradient-to-r from-gray-800 to-black group-hover:from-brand-purple/40 group-hover:to-black transition-colors"></div>

                                {/* Card Content (Avatar + Text) */}
                                <div className="relative -mt-12 px-4 text-center">

                                    {/* Avatar Image Circle */}
                                    <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-card-bg bg-input-bg shadow-md">
                                        {emp.photo_path ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`http://localhost:8000/static/${emp.photo_path}`}
                                                alt={emp.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-input-bg text-gray-600">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Employee Name & Details */}
                                    <div className="mt-4 mb-6">
                                        <h3 className="text-lg font-bold text-white group-hover:text-brand-green transition-colors">{emp.name}</h3>
                                        <p className="text-sm font-medium text-brand-purple">{emp.designation}</p>
                                        <p className="text-xs text-gray-500 mt-1">{emp.team} • {emp.employee_code}</p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mb-6 flex gap-2 justify-center">
                                        <button className="px-5 py-2 text-xs font-bold text-black uppercase bg-brand-green rounded-sm hover:bg-white border-2 border-brand-green hover:border-white transition-all transform group-hover:scale-105">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* No Results Message */}
                        {filtered.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500 bg-gray-900/50 rounded-lg border border-gray-800 border-dashed">
                                No employees found matching &quot;{search}&quot;
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
