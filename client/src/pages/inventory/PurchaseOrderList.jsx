import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Search, CheckCircle, Package, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';

export default function PurchaseOrderList() {
    const { user } = useAuth();
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPOs();
    }, []);

    const fetchPOs = async () => {
        try {
            const res = await axios.get('/purchases');
            setPos(res.data || []);
        } catch (error) {
            console.error('Failed to fetch POs', error);
            setPos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async (id) => {
        if (!window.confirm('Mark as Received? This will update stock levels.')) return;
        try {
            await axios.post(`/purchases/${id}/receive`);
            fetchPOs();
            alert('Stock Updated Successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to receive stock');
        }
    };

    const filtered = pos.filter(p =>
        p.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Purchase Orders</h1>
                    <p className="text-muted text-sm">Manage procurement and stock cost</p>
                </div>
                <Link to="/inventory/purchase-orders/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Purchase Order
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <Input
                        placeholder="Search POs..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card bg-white border border-border">
                <Table headers={['PO Number', 'Date', 'Supplier', 'Status', 'Total Cost', 'Actions']}>
                    {loading ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                                <div className="flex flex-col items-center justify-center text-muted">
                                    <FileText className="h-12 w-12 mb-2 text-gray-300" />
                                    <p>No purchase orders found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map(po => (
                            <TableRow key={po.id}>
                                <TableCell className="font-medium">{po.poNumber}</TableCell>
                                <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                                <TableCell>{po.supplier?.name || 'Unknown'}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${po.status === 'RECEIVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {po.status}
                                    </span>
                                </TableCell>
                                <TableCell>{formatCurrency(Number(po.totalAmount), user)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {po.status === 'PENDING' && (
                                            <Button size="sm" onClick={() => handleReceive(po.id)} className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="mr-1 h-3 w-3" /> Receive
                                            </Button>
                                        )}
                                        {/* View Details Button could go here */}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </Table>
            </div>
        </div>
    );
}
