import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-8 rounded-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">AMOG</h1>
                    <p className="text-muted text-sm mt-2">Certified Partner Portal</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
