import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart2,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Package,
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Printer
} from 'lucide-react';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import DateRangePicker from '../../components/common/DateRangePicker';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';

const ReportCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="card p-6 bg-white border border-border">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-primary">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
        {subtext && <p className="text-xs text-muted mt-4">{subtext}</p>}
    </div>
);

export default function Reports() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date Range State
    const [dateRange, setDateRange] = useState({
        label: 'This Month',
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });

    useEffect(() => {
        fetchData();
    }, [dateRange.start, dateRange.end]);

    const handleDateChange = (start, end, label) => {
        setDateRange({ start, end, label });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.start.toISOString(),
                endDate: dateRange.end.toISOString()
            };

            const [statsRes, productsRes] = await Promise.all([
                axios.get('/reports/dashboard', { params }), // Reuse dashboard endpoint logic
                axios.get('/reports/top-products', { params })
            ]);
            setStats(statsRes.data);
            setTopProducts(productsRes.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return <div className="p-8 text-center text-muted">Loading reports...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Reports & Insights</h1>
                    <p className="text-muted text-sm mt-1">
                        Performance for <span className="font-semibold text-primary">{dateRange.label}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border shadow-sm print:hidden">
                    <Calendar className="ml-2 h-4 w-4 text-muted" />
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={handleDateChange}
                    />
                </div>

                <div className="flex gap-2 print:hidden">
                    <Button variant="secondary" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                </div>
            </div>

            <div className="print-watermark">
                DEMO VERSION – Developed by MIDHUN SANIL - {new Date().toLocaleDateString()}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    title="Total Sales"
                    value={formatCurrency(Number(stats?.sales?.total || 0), user)}
                    icon={DollarSign}
                    color="bg-green-100 text-green-600"
                    subtext={`${stats?.sales?.count || 0} invoices in ${dateRange.label}`}
                />
                <ReportCard
                    title="Business Health"
                    value={`${stats?.healthScore ?? '-'}/100`}
                    icon={Activity}
                    color={stats?.healthScore >= 80 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}
                    subtext="Dynamic Score"
                />
                <ReportCard
                    title="Low Stock Items"
                    value={stats?.lowStock?.count ?? stats?.lowStock ?? 0}
                    icon={AlertTriangle}
                    color="bg-red-100 text-red-600"
                    subtext="Items below 5 qty"
                />
                <ReportCard
                    title="Avg. Order Value"
                    value={formatCurrency(Number(stats?.sales?.average || 0), user)}
                    icon={TrendingUp}
                    color="bg-blue-100 text-blue-600"
                    subtext={`Per order in ${dateRange.label}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products */}
                <div className="lg:col-span-2 card bg-white border border-border">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold text-primary">Top Performing Products</h3>
                    </div>
                    <Table headers={['Product Name', 'Sold Qty', 'Revenue']}>
                        {topProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted py-8">No sales data for this period</TableCell>
                            </TableRow>
                        ) : (
                            topProducts.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{item.product?.name || 'Unknown Product'}</TableCell>
                                    <TableCell>{item.totalSold} units</TableCell>
                                    <TableCell>{formatCurrency(Number(item.totalRevenue), user)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </Table>
                </div>

                {/* Simulation Widget */}
                <div className="card p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <BarChart2 className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold">What if I close today?</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-6">
                        Projected monthly loss if you stop operations right now based on average daily sales.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Projected Loss</p>
                            {formatCurrency((stats?.sales?.total || 0) * 1, user)}
                            <p className="text-xs text-gray-500 mt-1">*Based on {dateRange.label} so far</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
