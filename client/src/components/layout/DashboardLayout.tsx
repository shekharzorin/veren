import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, FileText, LogOut, Wallet, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Building2, label: 'Projects', to: '/projects' },
        { icon: Users, label: 'My Clients', to: '/clients', role: 'AGENT' },
        { icon: FileText, label: 'Transactions', to: '/transactions', role: 'AGENT' },
        { icon: Wallet, label: 'My Wallet', to: '/wallet' },
    ];

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 h-16 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <span className="text-lg font-bold text-slate-900 tracking-tight">AMOG</span>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 shadow-lg md:shadow-none",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 md:h-auto p-6 flex items-center border-b border-slate-100 md:border-none">
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight hidden md:block">AMOG</h1>
                    <span className="text-lg font-bold text-blue-900 tracking-tight md:hidden">Menu</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.role && user.role !== item.role && user.role !== 'AMOG_ADMIN') return null;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={closeMobileMenu}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
