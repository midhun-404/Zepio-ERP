import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { COUNTRIES, getCountryByCode } from '../../utils/currencyUtils';

export default function Signup() {
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        email: '',
        phone: '',
        country: 'US',
        currency: 'USD', // Added for backend
        currencySymbol: '$', // Added for backend
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'country') {
            const selectedCountry = getCountryByCode(value);
            setFormData(prev => ({
                ...prev,
                country: value,
                currency: selectedCountry.currency,
                currencySymbol: selectedCountry.symbol
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signup(formData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">ZEPIO</h1>
                    <p className="text-muted mt-2">Start your new shop today</p>
                </div>

                <div className="card p-8 bg-card shadow-sm border border-border">
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Shop Name
                            </label>
                            <input
                                type="text"
                                name="shopName"
                                required
                                className="input"
                                value={formData.shopName}
                                onChange={handleChange}
                                placeholder="My Awesome Store"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Owner Name
                                </label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    required
                                    className="input"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    className="input"
                                    value={formData.country}
                                    onChange={handleChange}
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="shop@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                minLength={6}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary py-2.5 font-medium"
                            >
                                {loading ? 'Creating Shop...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="text-accent hover:underline font-medium">
                            Sign In
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
