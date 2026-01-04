
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, Trash2, Plus, Minus, FileText, PauseCircle, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currencyUtils';

// Printable Invoice Component (Hidden except for Print)
const InvoiceTemplate = ({ data, user }) => {
    if (!data) return null;
    return (
        <div className="hidden print:block print:w-full print:p-4 text-black bg-white absolute inset-0 z-[100]">
            <div className="text-center mb-4">
                {user?.logoUrl && <img src={user.logoUrl} alt="Logo" className="h-16 mx-auto mb-2" />}
                <h1 className="text-2xl font-bold">{user?.name || 'My Shop'}</h1>
                <p className="text-sm whitespace-pre-wrap">{user?.address}</p>
                <p className="text-sm">Tel: {user?.phone}</p>
            </div>

            <div className="border-t border-b border-black py-2 my-2 text-sm flex justify-between">
                <div>
                    <p>Date: {new Date(data.date).toLocaleDateString()}</p>
                    <p>Bill #: {data.id?.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <p>Customer: {data.customer?.name || 'Walk-in'}</p>
                    <p>Mode: {data.paymentMode}</p>
                </div>
            </div>

            <table className="w-full text-sm mb-4">
                <thead>
                    <tr className="border-b border-black">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i}>
                            <td className="py-1">{item.name}</td>
                            <td className="text-center py-1">{item.quantity}</td>
                            <td className="text-right py-1">{formatCurrency(item.price, user)}</td>
                            <td className="text-right py-1">{formatCurrency(item.price * item.quantity, user)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(data.subtotal, user)}</span>
                </div>
                {data.discount > 0 && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(data.discount, user)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-black border-dashed pt-1 mt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(data.total, user)}</span>
                </div>
            </div>

            <div className="mt-8 text-center text-sm">
                <p className="whitespace-pre-wrap">{user?.receiptFooter || 'Thank you for your business!'}</p>
                <p className="text-xs mt-4 text-gray-500">Powered by Zepio ERP</p>
            </div>
        </div>
    );
};

export default function POS() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Checkout State
    const [showCheckout, setShowCheckout] = useState(false);
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [discount, setDiscount] = useState(0);
    const [paymentAmount, setPaymentAmount] = useState(''); // Allow partial

    // Held/Saved Bills
    const [heldBills, setHeldBills] = useState([]);
    const [showHeldModal, setShowHeldModal] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchHeldBills();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const fetchHeldBills = async () => {
        try {
            // Fetching all invoices and filtering client-side for now
            const res = await axios.get('/invoices');
            const held = res.data.filter(i => i.status === 'HELD' || i.status === 'QUOTATION');
            setHeldBills(held);
        } catch (error) {
            console.error('Failed to fetch held bills', error);
        }
    };

    const deleteBill = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;
        try {
            // Placeholder: functionality not fully implemented on backend in this scope
        } catch (e) { }
    };

    const resumeBill = (bill) => {
        loadFullBill(bill.id);
    };

    const loadFullBill = async (id) => {
        try {
            // Placeholder: needs backend update for full item details or mapped frontend logic
            // For now we rely on handleResume mapping
        } catch (e) {
            console.error(e);
        }
    };

    const handleResume = (bill) => {
        if (!bill.items || bill.items.length === 0) {
            alert("No items found in this bill to resume. (Backend update required)");
            return;
        }

        const mappedItems = bill.items.map(i => ({
            productId: i.productId,
            name: 'Unknown Product',
            // In a real app we'd fetch product name from ID or have it in invoice item
            price: Number(i.price),
            quantity: i.quantity
        }));

        const itemsWithNames = mappedItems.map(item => {
            const p = products.find(prod => prod.id === item.productId);
            return { ...item, name: p ? p.name : 'Unknown Product' };
        });

        setCart(itemsWithNames);
        setCustomer(bill.customer ? { name: bill.customer.name, phone: bill.customer.phone } : { name: '', phone: '' });
        setDiscount(bill.discount);
        setShowHeldModal(false);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);

    useEffect(() => {
        if (showCheckout) {
            setPaymentAmount(total.toString()); // Default to full amount
        }
    }, [showCheckout, total]);

    // Success Modal State
    const [successData, setSuccessData] = useState(null);

    const handlePrint = () => {
        window.print();
    };

    const handleCheckout = async (status = null) => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const payload = {
                items: cart,
                customerName: customer.name,
                customerPhone: customer.phone,
                discount: Number(discount),
                paymentMode,
                paymentAmount: status === 'HELD' || status === 'QUOTATION' ? 0 : Number(paymentAmount),
                status
            };

            const res = await axios.post('/invoices', payload);

            if (status === 'HELD' || status === 'QUOTATION') {
                alert(status === 'HELD' ? 'Bill Held Successfully!' : 'Quotation Created!');
                setCart([]);
                setCustomer({ name: '', phone: '' });
                setShowCheckout(false);
                setDiscount(0);
                fetchProducts();
                fetchHeldBills();
            } else {
                setSuccessData({
                    id: res.data.id,
                    items: [...cart],
                    total: total,
                    subtotal: subtotal,
                    discount: discount,
                    customer: customer,
                    date: new Date(),
                    paymentMode
                });
                setShowCheckout(false);
                setCart([]);
                setCustomer({ name: '', phone: '' });
                setDiscount(0);
                fetchProducts();
            }

        } catch (error) {
            console.error('Checkout failed', error);
            alert(error.response?.data?.error || 'Action Failed');
        } finally {
            setLoading(false);
        }
    };

    const resetAfterSuccess = () => {
        setSuccessData(null);
    };

    // Filter Products
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative">
            {/* Invoice Print Template - Outside main layout to avoid hidden parent */}
            <InvoiceTemplate data={successData} user={user} />

            {/* Main POS Interface - Hidden on Print */}
            <div className="h-[calc(100vh-6rem)] flex -m-8 relative print:hidden">

                {/* Success Modal */}
                {successData && (
                    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-primary">Sale Completed!</h2>
                                <p className="text-muted mt-1">Total: {formatCurrency(successData.total, user)}</p>
                            </div>
                            <div className="space-y-3">
                                <Button size="lg" className="w-full" onClick={handlePrint}>
                                    <FileText className="mr-2 h-4 w-4" /> Print Receipt
                                </Button>
                                <Button variant="outline" size="lg" className="w-full" onClick={resetAfterSuccess}>
                                    New Sale
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for Held Bills */}
                {showHeldModal && (
                    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold">Held Bills & Quotations</h2>
                                <button onClick={() => setShowHeldModal(false)} className="text-gray-500 hover:text-black">✕</button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1">
                                {heldBills.length === 0 ? (
                                    <p className="text-center text-muted py-8">No held bills found.</p>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b text-sm text-muted">
                                                <th className="py-2">Date</th>
                                                <th className="py-2">Type</th>
                                                <th className="py-2">Customer</th>
                                                <th className="py-2">Total</th>
                                                <th className="py-2">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {heldBills.map(bill => (
                                                <tr key={bill.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 text-sm">{new Date(bill.date).toLocaleDateString()}</td>
                                                    <td className="py-3">
                                                        <span className={`text-xs px-2 py-1 rounded ${bill.status === 'QUOTATION' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {bill.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-sm">{bill.customer?.name || 'Walk-in'}</td>
                                                    <td className="py-3 font-medium">{formatCurrency(Number(bill.totalAmount), user)}</td>
                                                    <td className="py-3">
                                                        <Button size="sm" variant="outline" onClick={() => handleResume(bill)}>
                                                            Resume
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Left: Product Selection */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 border-r border-gray-200">
                    <div className="mb-6 sticky top-0 bg-gray-50 z-10 pb-4 flex justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 h-12 text-lg rounded-lg border border-border shadow-sm focus:ring-2 focus:ring-accent focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                                className="p-4 bg-white rounded-lg border border-border hover:border-accent hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <h3 className="font-semibold text-primary truncate group-hover:text-accent">{product.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-bold text-gray-900">{formatCurrency(product.price, user)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock} left
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Cart & Checkout */}
                <div className="w-[400px] flex flex-col bg-white shadow-xl z-20">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center font-bold text-lg text-primary">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Current Sale
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleCheckout('HELD')}
                                disabled={cart.length === 0}
                                className="p-2 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center gap-1"
                                title="Hold Bill"
                            >
                                <PauseCircle className="h-4 w-4" /> Hold
                            </button>
                            <button
                                onClick={() => handleCheckout('QUOTATION')}
                                disabled={cart.length === 0}
                                className="p-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                                title="Save as Quote"
                            >
                                <FileText className="h-4 w-4" /> Quote
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted">
                                <ShoppingCart className="h-12 w-12 mb-2 text-gray-200" />
                                <p>Cart is empty</p>
                                <p className="text-xs">Scan or select items</p>
                                {heldBills.length > 0 && (
                                    <button
                                        onClick={() => setShowHeldModal(true)}
                                        className="mt-4 text-xs text-accent underline flex items-center gap-1"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        View {heldBills.length} held bills
                                    </button>
                                )}
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.productId} className="flex items-center justify-between p-3 border border-gray-100 rounded-md bg-white shadow-sm">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-primary truncate">{item.name}</p>
                                        <p className="text-xs text-muted">{formatCurrency(item.price, user)} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-primary">-</button>
                                        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-primary">+</button>
                                        <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-danger hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal, user)}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted">Discount</span>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    className="w-20 text-right text-xs bg-white border border-gray-300 rounded px-1 py-0.5"
                                />
                            </div>
                            <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-gray-300">
                                <span>Total</span>
                                <span>{formatCurrency(total, user)}</span>
                            </div>
                        </div>

                        {!showCheckout ? (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => setShowCheckout(true)}
                                disabled={cart.length === 0}
                            >
                                Proceed to Pay
                            </Button>
                        ) : (
                            <div className="space-y-3 bg-white p-3 rounded-md border border-gray-200 animate-in slide-in-from-bottom-5">
                                <Input
                                    placeholder="Customer Phone (Optional)"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    className="h-9 text-sm"
                                />
                                <Input
                                    placeholder="Customer Name (Optional)"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    className="h-9 text-sm"
                                />

                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold w-12">Pay:</label>
                                    <Input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="h-9 text-sm flex-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMode('CASH')}
                                        className={`flex items-center justify-center py-2 text-sm font-medium rounded-md border ${paymentMode === 'CASH' ? 'bg-primary text-white border-primary' : 'bg-white text-secondary border-gray-300'}`}
                                    >
                                        Cash
                                    </button>
                                    <button
                                        onClick={() => setPaymentMode('CARD')}
                                        className={`flex items-center justify-center py-2 text-sm font-medium rounded-md border ${paymentMode === 'CARD' ? 'bg-primary text-white border-primary' : 'bg-white text-secondary border-gray-300'}`}
                                    >
                                        Card
                                    </button>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button variant="secondary" className="flex-1" onClick={() => setShowCheckout(false)}>Cancel</Button>
                                    <Button className="flex-1" onClick={() => handleCheckout()} disabled={loading}>
                                        {loading ? 'Processing...' : 'Confirm'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
