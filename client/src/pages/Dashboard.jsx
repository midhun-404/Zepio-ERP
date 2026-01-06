import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Package,
    Activity,
    CreditCard,
    Calendar,
    CheckCircle,
    Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DateRangePicker from '../components/common/DateRangePicker';

import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currencyUtils';
import { useNavigate } from 'react-router-dom';

import { StatCard } from '../components/dashboard/StatCard';

// Removed internal StatCard definition

export default function Dashboard() {
    const { user } = useAuth(); // Get user for currency settings
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        label: 'Today',
        start: new Date(),
        end: new Date()
    });

    useEffect(() => {
        fetchStats();
    }, [dateRange.start, dateRange.end]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fix: If "Today", don't send client dates, let server use its time (Single Source of Truth)
            const params = {};
            if (dateRange.label !== 'Today') {
                params.startDate = dateRange.start.toISOString();
                params.endDate = dateRange.end.toISOString();
            }
            const res = await axios.get('/reports/dashboard', { params });
            setStats(res.data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                navigate('/login');
                return;
            }
            setError('Failed to load dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (start, end, label) => {
        setDateRange({ start, end, label });
    };

    if (loading && !stats) return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!stats && error) return (
        <div className="p-8 text-center">
            <div className="p-4 rounded-lg bg-red-50 inline-block mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-red-700 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
                onClick={fetchStats}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
                Retry Request
            </button>
        </div>
    );

    if (!stats) return <div className="p-8 text-center text-muted">Unable to load dashboard data.</div>;

    const salesValue = Number(stats.sales?.total || 0);
    const invoiceCount = Number(stats.sales?.count || 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Dashboard</h1>
                    <p className="text-muted text-sm mt-1">Real-time overview of your business performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/about"
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors font-medium text-sm"
                    >
                        <Info className="h-4 w-4" />
                        About Zepio
                    </Link>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border shadow-sm">
                        <Calendar className="ml-2 h-4 w-4 text-muted" />
                        <DateRangePicker
                            startDate={dateRange.start}
                            endDate={dateRange.end}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Sales"
                    value={salesValue === 0 ? "No Sales" : formatCurrency(salesValue, user)}
                    subtext={salesValue === 0 ? "Ready to start selling?" : `${invoiceCount} invoices generated`}
                    icon={DollarSign}
                    trend={salesValue > 0 ? "+12% vs last period" : "No activity"}
                    color="bg-blue-100 text-blue-600"
                    loading={loading}
                />
                <StatCard
                    title="Pending Collections"
                    value={formatCurrency(Number(stats.pendingPayments || 0), user)}
                    subtext="Unpaid invoices"
                    icon={CreditCard}
                    color="bg-orange-100 text-orange-600"
                    loading={loading}
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats.lowStock?.count || 0}
                    subtext="Items below threshold"
                    icon={AlertTriangle}
                    color="bg-red-100 text-red-600"
                    loading={loading}
                />
                <StatCard
                    title="Avg. Transaction"
                    value={formatCurrency(Number(stats.sales?.average || 0), user)}
                    subtext="Per invoice"
                    icon={TrendingUp}
                    color="bg-green-100 text-green-600"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 card bg-white border border-border shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            Recent Transactions
                        </h3>
                        <Link to="/billing" className="text-xs text-accent hover:underline">View All</Link>
                    </div>
                    <div className="p-0 flex-1 overflow-auto">
                        {!stats.recentSales || stats.recentSales.length === 0 ? (
                            <div className="p-8 text-center text-muted">No recent transactions.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 whitespace-nowrap">Date</th>
                                        <th className="px-6 py-3 whitespace-nowrap">Customer</th>
                                        <th className="px-6 py-3 text-right whitespace-nowrap">Amount</th>
                                        <th className="px-6 py-3 text-center whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.recentSales.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{new Date(invoice.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{invoice.customer?.name || 'Walk-in'}</td>
                                            <td className="px-6 py-3 text-sm text-right font-medium text-gray-900 whitespace-nowrap">{formatCurrency(Number(invoice.totalAmount), user)}</td>
                                            <td className="px-6 py-3 text-center whitespace-nowrap">
                                                <span className={`text-xs px-2 py-1 rounded-full ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="card bg-white border border-border shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-gray-400" />
                            Top Products
                        </h3>
                    </div>
                    <div className="p-0 flex-1 overflow-auto">
                        {!stats.topProducts || stats.topProducts.length === 0 ? (
                            <div className="p-8 text-center text-muted">No sales data yet.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {stats.topProducts.map((item, index) => (
                                    <div key={item.productId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-primary">{item.product?.name || 'Unknown Product'}</p>
                                                <p className="text-xs text-muted">{item.totalSold} sold</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(item.totalRevenue), user)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Health */}
                <div className="card bg-white p-6 border border-border flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                    <div className="relative">
                        <Activity className={`h-16 w-16 ${stats.healthScore >= 80 ? 'text-green-500' :
                            stats.healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary">Business Health Index</h3>
                        <p className="text-3xl font-bold mt-1 text-gray-900">{stats.healthScore || 0}/100</p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ${stats.healthScore >= 80 ? 'bg-green-500' :
                                stats.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${stats.healthScore || 0}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-muted max-w-[200px]">
                        Calculated based on sales momentum, pending collections, and inventory efficiency.
                    </p>
                </div>

                {/* Slow Moving Items (Dead Stock) */}
                <div className="lg:col-span-2 card bg-white border border-border shadow-sm flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            Slow Moving Inventory
                        </h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                            Unsold for 30+ days
                        </span>
                    </div>
                    <div className="p-0 flex-1 overflow-auto max-h-[250px]">
                        {!stats.deadStock?.data || stats.deadStock.data.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-8 text-muted">
                                <div className="p-3 bg-green-50 text-green-600 rounded-full mb-3">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <p className="font-bold text-primary">Efficient Inventory!</p>
                                <p className="text-sm mt-1">No slow-moving stock detected.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">Stock Value</th>
                                        <th className="px-6 py-3">Last Added</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.deadStock.data.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {formatCurrency(Number(item.price) * item.stock, user)}
                                                <span className="text-xs text-muted ml-1">({item.stock} units)</span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/billing" className="p-4 bg-white border border-border rounded-lg hover:border-accent hover:shadow-sm transition-all text-left group">
                    <p className="text-sm font-bold text-primary group-hover:text-accent">New Sale</p>
                    <p className="text-xs text-muted mt-1">Open POS Terminal</p>
                </Link>
                <Link to="/inventory/new" className="p-4 bg-white border border-border rounded-lg hover:border-accent hover:shadow-sm transition-all text-left group">
                    <p className="text-sm font-bold text-primary group-hover:text-accent">Add Product</p>
                    <p className="text-xs text-muted mt-1">Update Inventory</p>
                </Link>
                <Link to="/inventory/purchase-orders/new" className="p-4 bg-white border border-border rounded-lg hover:border-accent hover:shadow-sm transition-all text-left group">
                    <p className="text-sm font-bold text-primary group-hover:text-accent">New Purchase Order</p>
                    <p className="text-xs text-muted mt-1">Restock items</p>
                </Link>
                <Link to="/reports" className="p-4 bg-white border border-border rounded-lg hover:border-accent hover:shadow-sm transition-all text-left group">
                    <p className="text-sm font-bold text-primary group-hover:text-accent">View Reports</p>
                    <p className="text-xs text-muted mt-1">Download summaries</p>
                </Link>
            </div>
        </div>
    );
}
