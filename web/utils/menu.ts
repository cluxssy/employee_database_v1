import { Monitor, UserPlus, Users, Home, BookOpen, Star, HelpCircle, LogOut } from 'lucide-react';

export interface MenuItem {
    label: string;
    ariaLabel: string;
    link: string;
    icon?: any; // Optional icon class or component name if needed
}

const ALL_MENU_ITEMS = [
    { label: 'Home', ariaLabel: 'Dashboard', link: '/dashboard' },
    { label: 'Directory', ariaLabel: 'Employee Directory', link: '/employee-directory', roles: ['Admin', 'HR', 'Management'] },
    { label: 'Attendance', ariaLabel: 'Attendance & Leaves', link: '/attendance' },
    { label: 'Add Employee', ariaLabel: 'Add New Employee', link: '/add-employee', roles: ['Admin', 'HR'] },
    { label: 'Assets', ariaLabel: 'Manage Assets', link: '/manage-assets', roles: ['Admin', 'HR'] },
    { label: 'Performance', ariaLabel: 'Performance Management', link: '/performance', roles: ['Admin', 'HR', 'Management', 'Employee'] },
    { label: 'Training', ariaLabel: 'Training Management', link: '/training', roles: ['Admin', 'HR'] },
    { label: 'Admin Panel', ariaLabel: 'System Administration', link: '/admin', roles: ['Admin'] },
    { label: 'About Us', ariaLabel: 'About & Guide', link: '/about' },
    { label: 'Logout', ariaLabel: 'Sign Out', link: '/logout' }
];

export function getMenuItems(role?: string): MenuItem[] {
    if (!role) return [];

    return ALL_MENU_ITEMS.filter(item => {
        if (!item.roles) return true; // Available to all roles
        return item.roles.includes(role);
    }).map(({ roles, ...item }) => item); // Remove roles property for clean output
}
