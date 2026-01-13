import React from 'react';

const Dashboard: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Welcome back, {user.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6">
                    <h3 className="text-muted text-sm font-medium uppercase tracking-wider">Active Projects</h3>
                    <p className="text-3xl font-bold mt-2 text-primary">12</p>
                </div>
                <div className="premium-card p-6">
                    <h3 className="text-muted text-sm font-medium uppercase tracking-wider">My Clients</h3>
                    <p className="text-3xl font-bold mt-2 text-primary">48</p>
                </div>
                <div className="premium-card p-6">
                    <h3 className="text-muted text-sm font-medium uppercase tracking-wider">Pending EOIs</h3>
                    <p className="text-3xl font-bold mt-2 text-primary">5</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
