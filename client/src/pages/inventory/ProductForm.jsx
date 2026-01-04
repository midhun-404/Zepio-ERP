import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export default function ProductForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        costPrice: '',
        stock: '',
        sku: '',
        barcode: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/products', formData);
            navigate('/inventory');
        } catch (error) {
            console.error('Failed to save product', error);
            // TODO: Show toast notification
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/inventory')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-primary tracking-tight">Add New Product</h1>
                        <p className="text-muted text-sm mt-1">Create a new item in your inventory</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card bg-white border border-border p-6 space-y-8">
                {/* Basic Details */}
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 border-b border-gray-100 pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Product Name *"
                            name="name"
                            required
                            placeholder="e.g. Cotton T-Shirt"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Category"
                            name="category"
                            placeholder="e.g. Apparel"
                            value={formData.category}
                            onChange={handleChange}
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                placeholder="Product description..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 border-b border-gray-100 pb-2">Pricing & Inventory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Input
                            label="Selling Price *"
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                        />
                        <Input
                            label="Cost Price"
                            name="costPrice"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.costPrice}
                            onChange={handleChange}
                        />
                        <Input
                            label="Opening Stock"
                            name="stock"
                            type="number"
                            placeholder="0"
                            value={formData.stock}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Identification */}
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-4 border-b border-gray-100 pb-2">Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="SKU (Stock Keeping Unit)"
                            name="sku"
                            placeholder="e.g. TSH-001"
                            value={formData.sku}
                            onChange={handleChange}
                        />
                        <Input
                            label="Barcode"
                            name="barcode"
                            placeholder="Scan barcode..."
                            value={formData.barcode}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => navigate('/inventory')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
