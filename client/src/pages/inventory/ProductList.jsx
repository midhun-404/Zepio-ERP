import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export default function ProductList() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Quick Edit State
    const [quickEditMode, setQuickEditMode] = useState(false);
    const [editedProducts, setEditedProducts] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportCSV = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const importedData = results.data.map(item => ({
                    name: item.Name || item.name,
                    price: parseFloat(item.Price || item.price) || 0,
                    stock: parseInt(item.Stock || item.stock) || 0,
                    costPrice: parseFloat(item.CostPrice || item.costPrice) || 0,
                    sku: item.SKU || item.sku,
                    category: item.Category || item.category,
                    description: item.Description || item.description
                }));

                try {
                    await axios.post('/products/bulk', importedData);
                    fetchProducts();
                    alert('Products imported successfully!');
                } catch (error) {
                    console.error('Import Error:', error);
                    alert('Failed to import products.');
                }
            }
        });
    };

    const handleExportCSV = () => {
        const csvData = products.map(p => ({
            Name: p.name,
            Price: p.price,
            Stock: p.stock,
            CostPrice: p.costPrice,
            SKU: p.sku,
            Category: p.category,
            Description: p.description
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleQuickEditChange = (id, field, value) => {
        setEditedProducts(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value
            }
        }));
    };

    const handleSaveQuickEdit = async () => {
        try {
            const updates = Object.keys(editedProducts).map(id => ({
                id,
                ...editedProducts[id]
            }));

            await axios.put('/products/bulk', updates);
            setQuickEditMode(false);
            setEditedProducts({});
            fetchProducts();
            alert('Bulk update successful');
        } catch (error) {
            console.error('Bulk Update Error:', error);
            alert('Failed to update products');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Inventory</h1>
                    <p className="text-muted text-sm mt-1">Manage your products and stock levels</p>
                </div>
                <div className="flex gap-2">
                    {/* CSV Import */}
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        id="csvImport"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImportCSV(file);
                        }}
                    />
                    <Button variant="outline" onClick={() => document.getElementById('csvImport').click()}>
                        Import CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV}>
                        Export CSV
                    </Button>

                    {quickEditMode ? (
                        <>
                            <Button variant="outline" onClick={() => {
                                setQuickEditMode(false);
                                setEditedProducts({}); // Discard changes
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveQuickEdit} disabled={Object.keys(editedProducts).length === 0}>
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button variant="secondary" onClick={() => setQuickEditMode(true)}>
                            Quick Edit
                        </Button>
                    )}

                    <Link to="/inventory/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="pl-9 input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {/* Filter Placeholder */}
                    <select className="input w-40">
                        <option value="">All Categories</option>
                    </select>
                </div>
            </div>

            <div className="card bg-white border border-border">
                <Table headers={['Product Name', 'Category', 'Price', 'Cost Price', 'Stock', 'Status', 'Actions']}>
                    {loading ? (
                        <TableRow>
                            <TableCell className="text-center py-8" colSpan={7}>Loading products...</TableCell>
                        </TableRow>
                    ) : filteredProducts.length === 0 ? (
                        <TableRow>
                            <TableCell className="text-center py-12" colSpan={7}>
                                <div className="flex flex-col items-center justify-center text-muted">
                                    <Package className="h-12 w-12 mb-2 text-gray-300" />
                                    <p>No products found.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredProducts.map((product) => {
                            const isEdited = editedProducts[product.id];
                            const current = isEdited ? { ...product, ...editedProducts[product.id] } : product;

                            return (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-primary">{product.name}</p>
                                            <p className="text-xs text-muted">SKU: {product.sku || 'N/A'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {quickEditMode ? (
                                            <input
                                                className="w-full text-xs p-1 border rounded"
                                                value={current.category || ''}
                                                onChange={(e) => handleQuickEditChange(product.id, 'category', e.target.value)}
                                            />
                                        ) : (
                                            product.category || 'Uncategorized'
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {quickEditMode ? (
                                            <input
                                                type="number"
                                                className="w-20 text-xs p-1 border rounded"
                                                value={current.price}
                                                onChange={(e) => handleQuickEditChange(product.id, 'price', e.target.value)}
                                            />
                                        ) : (
                                            formatCurrency(Number(product.price), user)
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted">
                                        {quickEditMode ? (
                                            <input
                                                type="number"
                                                className="w-20 text-xs p-1 border rounded"
                                                value={current.costPrice || ''}
                                                onChange={(e) => handleQuickEditChange(product.id, 'costPrice', e.target.value)}
                                            />
                                        ) : (
                                            formatCurrency(Number(product.costPrice || 0), user)
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {quickEditMode ? (
                                            <input
                                                type="number"
                                                className="w-16 text-xs p-1 border rounded"
                                                value={current.stock}
                                                onChange={(e) => handleQuickEditChange(product.id, 'stock', e.target.value)}
                                            />
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {product.stock} units
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.stock <= 5 && (
                                            <div className="flex items-center text-xs text-danger font-medium">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Low Stock
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </Table>
            </div>
        </div>
    );
}
