import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, Trash2, RotateCcw, Building, Receipt, Percent, ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRIES, getCountryByCode } from '../utils/currencyUtils';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [resetting, setResetting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        country: 'US', // Added
        currencySymbol: '$',
        currency: 'USD',
        taxPercentage: 0,
        taxInclusive: false,
        receiptFooter: '',
        logoUrl: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/settings');
            const shopData = res.data || {};
            setShop(shopData);
            setFormData({
                name: shopData.name || '',
                address: shopData.address || '',
                phone: shopData.phone || '',
                country: shopData.country || 'US', // Added
                currencySymbol: shopData.currencySymbol || '$',
                currency: shopData.currency || 'USD',
                taxPercentage: shopData.taxPercentage || 0,
                taxInclusive: shopData.taxInclusive || false,
                receiptFooter: shopData.receiptFooter || '',
                logoUrl: shopData.logoUrl || ''
            });
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'country') {
            const selectedCountry = getCountryByCode(value);
            setFormData(prev => ({
                ...prev,
                country: value,
                currency: selectedCountry.currency,
                currencySymbol: selectedCountry.symbol
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('/settings', formData);
            updateUser(formData); // Update global context immediately
            alert('Settings saved successfully!');
            fetchSettings();
        } catch (error) {
            console.error('Failed to save', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async (type) => {
        // console.log('DEBUG: handleReset called with', type);
        // alert(`DEBUG: Reset Clicked for ${type}`); // Temporary debug
        if (loading || resetting) return;

        const isFactoryReset = type === 'all';
        const msg = isFactoryReset
            ? 'DANGER: This will delete EVERYTHING including Products and Customers. Irreversible.\n\nTo confirm, please type "DELETE" below:'
            : 'CRITICAL: This will delete ALL sales, invoices, and payments. Inventory counts remains.\n\nTo confirm, please type "RESET" below:';

        const confirmation = window.prompt(msg);

        if (isFactoryReset && confirmation !== 'DELETE') {
            if (confirmation) alert('Incorrect confirmation text. Action cancelled.');
            return;
        }

        if (!isFactoryReset && confirmation !== 'RESET') {
            if (confirmation) alert('Incorrect confirmation text. Action cancelled.');
            return;
        }

        setResetting(true);
        try {
            await axios.post('/settings/reset', { type });
            alert('Reset complete.');
            window.location.reload();
        } catch (error) {
            alert('Reset failed');
        } finally {
            setResetting(false);
        }
    };

    const handleDeleteAccount = async () => {
        // alert('DEBUG: Delete Account Clicked'); // Temporary debug
        if (loading || resetting) return;

        const confirmation = window.prompt("DANGER: This will permanently delete your ACCOUNT, SHOP, and ALL DATA.\n\nType the word 'CONFIRM' to proceed:");

        if (confirmation !== 'CONFIRM') {
            if (confirmation) alert('Incorrect confirmation. Deletion cancelled.');
            return;
        }

        setResetting(true);
        try {
            await axios.delete('/settings/account');
            alert('Account deleted. Goodbye.');
            // Force logout / redirect
            localStorage.clear();
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
            alert('Failed to delete account');
            setResetting(false);
        }
    };


    if (loading) return <div className="p-8 text-center text-muted">Loading settings...</div>;

    const tabs = [
        { id: 'general', label: 'General', icon: Building },
        { id: 'tax', label: 'Tax & Currency', icon: Percent },
        { id: 'receipt', label: 'Receipt', icon: Receipt },
        { id: 'danger', label: 'Danger Zone', icon: ShieldAlert, danger: true },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-primary mb-6">Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                ${activeTab === tab.id
                                    ? (tab.danger ? 'bg-red-50 text-danger' : 'bg-white shadow text-primary')
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon className={`mr-3 h-5 w-5 ${tab.danger ? 'text-danger' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="card bg-white p-6 border border-border space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-lg font-bold border-b pb-2">Shop Profile</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <Input label="Shop Name" name="name" value={formData.name} onChange={handleChange} />
                                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Country / Region</label>
                                    <select
                                        name="country"
                                        className="input w-full"
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        {COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted mt-1">Changing country will update currency settings.</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Address</label>
                                    <textarea
                                        name="address"
                                        className="input w-full h-24"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <Input label="Owner Email" value={user?.email} disabled className="bg-gray-50" />
                            </div>
                            <div className="pt-4">
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tax & Currency */}
                    {activeTab === 'tax' && (
                        <div className="card bg-white p-6 border border-border space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-lg font-bold border-b pb-2">Tax & Currency</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Currency Code" name="currency" value={formData.currency} onChange={handleChange} />
                                <Input label="Currency Symbol" name="currencySymbol" value={formData.currencySymbol} onChange={handleChange} />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-gray-900">Tax Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Default Tax Rate (%)</label>
                                        <Input
                                            type="number"
                                            name="taxPercentage"
                                            value={formData.taxPercentage}
                                            onChange={handleChange}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted">Applied automatically to new invoices.</p>
                                    </div>
                                    <div className="flex items-center h-full pt-6">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="taxInclusive"
                                                checked={formData.taxInclusive}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium">Prices include Tax?</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Receipt */}
                    {activeTab === 'receipt' && (
                        <div className="card bg-white p-6 border border-border space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-lg font-bold border-b pb-2">Receipt Customization</h2>
                            <div className="space-y-4">
                                <Input label="Logo URL" name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" />
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Receipt Footer Message</label>
                                    <textarea
                                        name="receiptFooter"
                                        className="input w-full h-24"
                                        placeholder="Thank you for shopping with us!"
                                        value={formData.receiptFooter}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="mr-2 h-4 w-4" /> Save Receipt Settings
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'danger' && (
                        <div className="card bg-red-50 border border-red-100 p-6 space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 text-danger border-b border-red-200 pb-2">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="text-lg font-bold">Danger Zone</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-red-100 gap-4">
                                    <div>
                                        <p className="font-bold text-gray-900">Reset Sales Data</p>
                                        <p className="text-sm text-muted">Deletes all invoices, payments, and reports. Keeps products.</p>
                                    </div>
                                    <Button type="button" variant="danger" onClick={() => handleReset('sales')} disabled={resetting} className="w-full sm:w-auto">
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        {resetting ? 'Resetting...' : 'Reset Sales'}
                                    </Button>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-red-100 gap-4">
                                    <div>
                                        <p className="font-bold text-gray-900">Factory Reset</p>
                                        <p className="text-sm text-muted">Deletes EVERYTHING: Products, Customers, Sales. Irreversible.</p>
                                    </div>
                                    <Button type="button" variant="danger" onClick={() => handleReset('all')} disabled={resetting} className="w-full sm:w-auto">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {resetting ? 'Wiping...' : 'Factory Reset'}
                                    </Button>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-100 rounded-lg border border-red-200 gap-4">
                                    <div>
                                        <p className="font-bold text-red-900">Delete Account</p>
                                        <p className="text-sm text-red-700">Permanently delete your account and all data. No going back.</p>
                                    </div>
                                    <Button type="button" variant="danger" onClick={handleDeleteAccount} disabled={resetting} className="bg-red-700 hover:bg-red-800 text-white w-full sm:w-auto">
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                        {resetting ? 'Deleting...' : 'Delete Account'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
