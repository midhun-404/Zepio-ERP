import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">ZEPIO</h1>
                    <p className="text-muted mt-2">Sign in to your shop</p>
                </div>

                <div className="card p-8 bg-card shadow-sm border border-border">
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@shop.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-2.5 font-medium"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted">Don't have an account? </span>
                        <Link to="/signup" className="text-accent hover:underline font-medium">
                            Create a Shop
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-muted">
                    <p>© {new Date().getFullYear()} ZEPIO ERP. Developed by MIDHUN SANIL</p>
                </div>
            </div>
        </div>
    );
}
