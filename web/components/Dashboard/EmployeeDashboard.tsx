export default function EmployeeDashboard({ user }: { user: any }) {
    if (!user) return null;

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-6">
                Hello, <span className="text-brand-purple">{user.username}</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Profile Summary Card */}
                <div className="bg-[#111] border border-[#222] p-6 rounded-3xl">
                    <h2 className="text-xl font-bold mb-4">My Profile</h2>
                    <p className="text-gray-400 mb-4">View your personal details, specific documents, and employment history.</p>
                    <a href={`/employee-profile/${user.employee_code || 'my-profile'}`} className="inline-block px-4 py-2 bg-brand-purple rounded-lg text-white font-bold">
                        View Profile
                    </a>
                </div>

                {/* 2. Performance / KRA Card */}
                <div className="bg-[#111] border border-[#222] p-6 rounded-3xl">
                    <h2 className="text-xl font-bold mb-4">My Performance</h2>
                    <p className="text-gray-400 mb-4">Check your assigned KRAs and submit self-ratings.</p>
                    <button className="px-4 py-2 bg-[#333] rounded-lg text-white font-bold hover:bg-[#444] transition-colors">
                        View Details
                    </button>
                </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-brand-purple/10 to-transparent border border-brand-purple/20 rounded-3xl">
                <h2 className="text-2xl font-bold mb-2">Announcements</h2>
                <p className="text-gray-300">No new announcements at this time.</p>
            </div>
        </div>
    );
}
