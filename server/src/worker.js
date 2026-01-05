
/**
 * Cloudflare Worker Entry Point
 * 
 * Note: Express.js requires specific handling to run on Cloudflare Workers.
 * Native SQLite is NOT supported. You must provide a DATABASE_URL 
 * pointing to an external Postgres/MySQL/LibSQL database.
 */

// We use 'require' because the app is CommonJS
// const app = require('./app'); // Disabled for initial Cloudflare deployment to avoid bundling issues with 'fs', 'crypto', etc.

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // API Routes
        if (url.pathname.startsWith('/api')) {
            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            };

            if (request.method === 'OPTIONS') {
                return new Response(null, { headers });
            }

            // Auth: Login
            if (url.pathname === '/api/auth/login' && request.method === 'POST') {
                const body = await request.json();
                return new Response(JSON.stringify({
                    success: true,
                    token: "demo-token-" + Date.now(),
                    user: {
                        id: 1,
                        name: "Demo User",
                        email: body.email,
                        role: "admin",
                        avatar: null
                    }
                }), { headers });
            }

            // Auth: Signup
            if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
                const body = await request.json();
                return new Response(JSON.stringify({
                    success: true,
                    token: "demo-token-" + Date.now(),
                    user: {
                        id: 2,
                        name: body.fullName || "New User",
                        email: body.email,
                        role: "user",
                        avatar: null
                    }
                }), { headers });
            }

            // Settings
            if (url.pathname === '/api/settings' && request.method === 'GET') {
                return new Response(JSON.stringify({
                    currency: "USD",
                    theme: "light",
                    companyName: "Demo Company"
                }), { headers });
            }

            // --- Mock Data Endpoints to prevent Crashes ---

            // Inventory: Products
            if (url.pathname === '/api/products' && request.method === 'GET') {
                return new Response(JSON.stringify([
                    { id: 1, name: "Demo Product A", sku: "DP-001", price: 100, stock: 50, category: "Electronics" },
                    { id: 2, name: "Demo Product B", sku: "DP-002", price: 250, stock: 20, category: "Furniture" }
                ]), { headers });
            }

            // Inventory: Suppliers
            if (url.pathname === '/api/suppliers' && request.method === 'GET') {
                return new Response(JSON.stringify([
                    { id: 1, name: "Global Supplies Inc", email: "contact@globalsupplies.com", phone: "123-456-7890" },
                    { id: 2, name: "Local Vendors Ltd", email: "sales@localvendors.com", phone: "987-654-3210" }
                ]), { headers });
            }

            // Inventory: Purchase Orders
            if (url.pathname === '/api/purchases' && request.method === 'GET') {
                return new Response(JSON.stringify([
                    { id: 101, displayId: "PO-101", supplierId: 1, date: "2025-01-01", status: "Received", total: 5000, Supplier: { name: "Global Supplies Inc" } }
                ]), { headers });
            }

            // Billing: Invoices
            if (url.pathname === '/api/invoices' && request.method === 'GET') {
                return new Response(JSON.stringify([
                    { id: 201, invoiceNumber: "INV-2025-001", customerName: "John Doe", date: "2025-01-02", total: 150, status: "Paid" }
                ]), { headers });
            }

            // Reports: Dashboard Stats
            if (url.pathname === '/api/reports/dashboard' && request.method === 'GET') {
                return new Response(JSON.stringify({
                    sales: {
                        total: 15430,
                        count: 45,
                        average: 342
                    },
                    pendingPayments: 2350,
                    lowStock: {
                        count: 2,
                        items: []
                    },
                    healthScore: 85,
                    recentSales: [
                        { id: 101, date: "2025-01-05", customer: { name: "Alice Smith" }, totalAmount: 120.50, status: "PAID" },
                        { id: 102, date: "2025-01-04", customer: { name: "Bob Jones" }, totalAmount: 450.00, status: "PARTIAL" },
                        { id: 103, date: "2025-01-03", customer: { name: "Charlie Day" }, totalAmount: 89.99, status: "PAID" }
                    ],
                    topProducts: [
                        { productId: 1, product: { name: "Wireless Headphones" }, totalSold: 15, totalRevenue: 1500 },
                        { productId: 2, product: { name: "Ergonomic Chair" }, totalSold: 8, totalRevenue: 2400 },
                        { productId: 3, product: { name: "Mechanical Keyboard" }, totalSold: 5, totalRevenue: 750 }
                    ],
                    deadStock: {
                        data: []
                    },
                    monthlyRevenue: [1200, 1900, 3000, 5000, 2000, 3000, 4500]
                }), { headers });
            }

            // Reports: Top Products
            if (url.pathname === '/api/reports/top-products' && request.method === 'GET') {
                return new Response(JSON.stringify([
                    { name: "Demo Product A", sales: 120 },
                    { name: "Demo Product B", sales: 85 }
                ]), { headers });
            }

            // Fallback for other API routes to prevent crashes
            return new Response(JSON.stringify({
                status: 'success',
                message: 'Demo Mode: Action simulated successfully.'
            }), { headers });
        }

        // Serve Static Assets (Frontend)
        // usage of 'ASSETS' binding defined in wrangler.toml
        if (env.ASSETS) {
            try {
                const response = await env.ASSETS.fetch(request);
                if (response.status === 404 && !url.pathname.includes('.')) {
                    // SPA Fallback: serve index.html for unknown paths that look like routes
                    return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
                }
                return response;
            } catch (e) {
                return new Response("Error loading asset: " + e.message, { status: 500 });
            }
        }

        return new Response("ASSETS binding not found. Check wrangler.toml", { status: 500 });
    }
};
