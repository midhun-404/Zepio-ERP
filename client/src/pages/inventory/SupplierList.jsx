import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Truck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableRow, TableCell } from '../../components/common/Table';

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('/suppliers');
            setSuppliers(res.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/suppliers/${editingId}`, formData);
            } else {
                await axios.post('/suppliers', formData);
            }
            fetchSuppliers();
            setShowModal(false);
            setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
            setEditingId(null);
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleEdit = (supplier) => {
        setFormData(supplier);
        setEditingId(supplier.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete supplier?')) return;
        try {
            await axios.delete(`/suppliers/${id}`);
            fetchSuppliers();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Suppliers</h1>
                    <p className="text-muted text-sm">Manage your vendors and order sources</p>
                </div>
                <Button onClick={() => { setEditingId(null); setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' }); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <Input
                        placeholder="Search suppliers..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card bg-white border border-border">
                <Table headers={['Name', 'Contact Person', 'Phone', 'Email', 'Actions']}>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                                <div className="flex flex-col items-center justify-center text-muted">
                                    <Truck className="h-12 w-12 mb-2 text-gray-300" />
                                    <p>No suppliers found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filtered.map(s => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.name}</TableCell>
                                <TableCell>{s.contactPerson || '-'}</TableCell>
                                <TableCell>{s.phone || '-'}</TableCell>
                                <TableCell>{s.email || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </Table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Supplier' : 'New Supplier'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <Input placeholder="Company Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <Input placeholder="Contact Person" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                            <Input placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <Input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <Input placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            <div className="flex gap-2 mt-4">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
