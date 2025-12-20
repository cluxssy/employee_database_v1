'use client';

import { useState, useEffect } from 'react';
import StaggeredMenu from '../../components/navBar';

export default function DashboardPage() {
    const menuItems = [
        { label: 'Home', ariaLabel: 'Dashboard Home', link: '/dashboard' },
        { label: 'Directory', ariaLabel: 'Employee Directory', link: '/employee-directory' },
        { label: 'Services', ariaLabel: 'View our services', link: '/services' },
        { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
    ];

    return (
        <div className="min-h-screen bg-brand-black text-white relative">
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

            <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-0">
                <div className="max-w-2xl animate-fade-in-up">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-6">
                        Welcome, User
                    </h1>
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                        This is your central hub for managing HR tasks. Access the employee directory, view services, and more from the menu.
                    </p>

                    <div className="p-1 rounded-xl bg-gradient-to-r from-brand-purple to-brand-green">
                        <div className="bg-brand-black rounded-lg p-6">
                            <p className="text-sm text-gray-300">
                                Check the <strong>Directory</strong> to find team members.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
