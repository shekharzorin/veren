import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="name@company.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="••••••••"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
                Sign In
            </button>
        </form>
    );
};

export default LoginPage;
