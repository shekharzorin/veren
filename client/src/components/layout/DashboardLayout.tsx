import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, FileText, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Building2, label: 'Projects', to: '/projects' },
        { icon: Users, label: 'My Clients', to: '/clients', role: 'AGENT' },
        { icon: FileText, label: 'Transactions', to: '/transactions', role: 'AGENT' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-slate-200 fixed h-full flex flex-col z-20 transition-all duration-300">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-primary tracking-tight">AMOG</h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        if (item.role && user.role !== item.role && user.role !== 'AMOG_ADMIN') return null;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted hover:bg-slate-50 hover:text-secondary-foreground"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
