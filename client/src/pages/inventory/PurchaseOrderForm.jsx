import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';

export default function PurchaseOrderForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    // Form State
    const [supplierId, setSupplierId] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([]);

    // Item input state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await axios.get('/suppliers');
            setSuppliers(res.data);
            if (res.data.length > 0) setSupplierId(res.data[0].id);
        } catch (error) {
            console.error('Failed to fetch suppliers');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Failed', error);
        }
    };

    // Filter products for search
    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }
        const results = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
        setSearchResults(results);
    }, [searchTerm, products]);

    const addItem = (product) => {
        setItems(prev => {
            if (prev.find(i => i.productId === product.id)) return prev;
            return [...prev, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                unitCost: product.costPrice || 0
            }];
        });
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) return { ...item, [field]: value };
            return item;
        }));
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitCost)), 0);

    const handleSubmit = async () => {
        if (!supplierId) return alert('Select a supplier');
        if (items.length === 0) return alert('Add at least one item');

        try {
            await axios.post('/purchases', {
                supplierId,
                notes,
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: Number(i.quantity),
                    unitCost: Number(i.unitCost)
                }))
            });
            alert('Purchase Order Created!');
            navigate('/inventory/purchase-orders');
        } catch (error) {
            console.error(error);
            alert('Failed to create PO');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/inventory/purchase-orders">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <h1 className="text-2xl font-bold text-primary">New Purchase Order</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-white p-6 border border-border space-y-4">
                    <h3 className="font-semibold text-lg">Supplier Details</h3>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Supplier</label>
                        <select
                            className="input w-full"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Notes / Reference</label>
                        <textarea
                            className="input w-full min-h-[80px]"
                            placeholder="Optional notes..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card bg-white p-6 border border-border space-y-4">
                    <h3 className="font-semibold text-lg">Add Items</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <Input
                            placeholder="Search product to add..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-border shadow-lg rounded-md max-h-48 overflow-y-auto">
                                {searchResults.map(p => (
                                    <div
                                        key={p.id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                                        onClick={() => addItem(p)}
                                    >
                                        <span className="font-medium text-sm">{p.name}</span>
                                        <span className="text-xs text-muted">Stock: {p.stock}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card bg-white border border-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-sm font-medium text-muted border-b border-border">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4 w-32">Quantity</th>
                            <th className="p-4 w-32">Unit Cost</th>
                            <th className="p-4 w-32">Total</th>
                            <th className="p-4 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted">No items added yet.</td></tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={item.productId} className="group hover:bg-gray-50">
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitCost}
                                            onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-4 font-medium">
                                        {formatCurrency(item.quantity * item.unitCost, user)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-danger">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-border">
                        <tr>
                            <td colSpan={3} className="p-4 text-right font-bold text-muted">Total Amount:</td>
                            <td className="p-4 font-bold text-lg text-primary">{formatCurrency(totalAmount, user)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end gap-4">
                <Link to="/inventory/purchase-orders">
                    <Button variant="secondary" size="lg">Cancel</Button>
                </Link>
                <Button size="lg" onClick={handleSubmit} disabled={items.length === 0}>
                    Create Purchase Order
                </Button>
            </div>
        </div>
    );
}
