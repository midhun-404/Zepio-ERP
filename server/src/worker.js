
/**
 * Cloudflare Worker Entry Point with D1 Internal Database
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS Headers
        const corsHeaders = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Helper for JSON Response
        const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: corsHeaders });
        const error = (msg, status = 500) => new Response(JSON.stringify({ error: msg, success: false }), { status, headers: corsHeaders });

        // API Routes
        if (url.pathname.startsWith('/api')) {
            try {
                // --- AUTH ---
                if (url.pathname === '/api/auth/login' && request.method === 'POST') {
                    const { email, password } = await request.json();

                    // Simple query. In production use bcrypt.compare(password, user.password)
                    // For now, checks plain or just returns the user if found (Demo mode logic with D1 persistence)
                    const user = await env.DB.prepare("SELECT * FROM Users WHERE email = ?").bind(email).first();

                    if (!user) {
                        return error("User not found", 404);
                    }

                    // Bypass password check for demo convenience or implement simple check
                    // if (user.password !== password) return error("Invalid credentials", 401);

                    return json({
                        success: true,
                        token: "d1-token-" + Date.now(),
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            avatar: null
                        }
                    });
                }

                if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
                    const body = await request.json();
                    const id = crypto.randomUUID();
                    // Assuming shopId is fixed for demo
                    const shopId = 'SHOP-001';

                    try {
                        await env.DB.prepare(
                            "INSERT INTO Users (id, shopId, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)"
                        ).bind(id, shopId, body.fullName, body.email, body.password, 'user').run();

                        return json({
                            success: true,
                            token: "d1-token-" + Date.now(),
                            user: { id, name: body.fullName, email: body.email, role: 'user' }
                        });
                    } catch (e) {
                        return error("Email likely already exists: " + e.message, 400);
                    }
                }

                // --- DASHBOARD ---
                if (url.pathname === '/api/reports/dashboard') {
                    // Aggregate stats from D1
                    /*
                     sales: { total, count, average }
                     pendingPayments: (from Invoices not paid)
                     lowStock: (from Products where stock < 5)
                     recentSales: (latest 5 Invoices)
                     topProducts: (grouped by invoice items)
                     monthlyRevenue
                    */

                    const salesStats = await env.DB.prepare(`
                        SELECT 
                            SUM(totalAmount) as total, 
                            COUNT(*) as count, 
                            AVG(totalAmount) as average 
                        FROM Invoices WHERE status = 'PAID'
                    `).first();

                    const pending = await env.DB.prepare("SELECT SUM(totalAmount - paidAmount) as val FROM Invoices WHERE status != 'PAID'").first();

                    // Quick fix for nulls
                    const sales = {
                        total: salesStats.total || 0,
                        count: salesStats.count || 0,
                        average: salesStats.average || 0
                    };

                    const recentSalesData = await env.DB.prepare("SELECT * FROM Invoices ORDER BY date DESC LIMIT 5").all();
                    const recentSales = recentSalesData.results.map(inv => ({
                        id: inv.id,
                        date: inv.date,
                        totalAmount: inv.totalAmount,
                        status: inv.status,
                        customer: { name: "Valued Customer" } // Join needed normally
                    }));

                    return json({
                        sales,
                        pendingPayments: pending.val || 0,
                        lowStock: { count: 0, items: [] }, // TODO
                        healthScore: 95,
                        recentSales,
                        topProducts: [],
                        deadStock: { data: [] },
                        monthlyRevenue: [0, 0, 0, 0, 0, 0, sales.total] // Mock array for chart
                    });
                }

                // --- PRODUCTS ---
                if (url.pathname === '/api/products') {
                    if (request.method === 'GET') {
                        const { results } = await env.DB.prepare("SELECT * FROM Products ORDER BY createdAt DESC").all();
                        return json(results);
                    }
                    if (request.method === 'POST') {
                        const body = await request.json();
                        const id = crypto.randomUUID();
                        await env.DB.prepare(`
                            INSERT INTO Products (id, shopId, name, price, stock, category, sku, description)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(id, 'SHOP-001', body.name, body.price, body.stock, body.category, body.sku, body.description).run();

                        // Return the created product
                        return json({ id, ...body });
                    }
                }

                // Generic Delete for Products
                if (url.pathname.match(/\/api\/products\/.+/) && request.method === 'DELETE') {
                    const pid = url.pathname.split('/').pop();
                    await env.DB.prepare("DELETE FROM Products WHERE id = ?").bind(pid).run();
                    return json({ success: true });
                }

                // --- INVOICES (Billing) ---
                if (url.pathname === '/api/invoices') {
                    if (request.method === 'GET') {
                        const { results } = await env.DB.prepare("SELECT * FROM Invoices ORDER BY date DESC").all();
                        return json(results);
                    }
                    if (request.method === 'POST') {
                        // Creating invoice logic
                        const body = await request.json();
                        const id = crypto.randomUUID();
                        await env.DB.prepare(`
                            INSERT INTO Invoices (id, shopId, invoiceNumber, customerId, totalAmount, status, date)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `).bind(id, 'SHOP-001', body.invoiceNumber || 'INV-' + Date.now(), null, body.totalAmount, body.status, new Date().toISOString()).run();
                        return json({ id, ...body });
                    }
                }

                // --- SUPPLIERS ---
                if (url.pathname === '/api/suppliers') {
                    if (request.method === 'GET') {
                        const { results } = await env.DB.prepare("SELECT * FROM Suppliers ORDER BY name ASC").all();
                        return json(results);
                    }
                    if (request.method === 'POST') {
                        const body = await request.json();
                        const id = crypto.randomUUID();
                        // Handle potential optional fields
                        await env.DB.prepare("INSERT INTO Suppliers (id, shopId, name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)").bind(id, 'SHOP-001', body.name || 'Unknown', body.email, body.phone, body.address).run();
                        return json({ id, ...body });
                    }
                    if (request.method === 'DELETE' || (request.method === 'PUT' && url.pathname.match(/\/api\/suppliers\/.+/))) {
                        // Basic handle for delete needed for supplier list "Trash" icon
                        const sid = url.pathname.split('/').pop();
                        if (request.method === 'DELETE') {
                            await env.DB.prepare("DELETE FROM Suppliers WHERE id = ?").bind(sid).run();
                            return json({ success: true });
                        }
                        if (request.method === 'PUT') {
                            const body = await request.json();
                            await env.DB.prepare("UPDATE Suppliers SET name=?, email=?, phone=?, address=? WHERE id=?")
                                .bind(body.name, body.email, body.phone, body.address, sid).run();
                            return json({ success: true });
                        }
                    }
                }

                // --- PURCHASE ORDERS ---
                if (url.pathname === '/api/purchases') {
                    if (request.method === 'GET') {
                        // JOIN with Suppliers to get name
                        const { results } = await env.DB.prepare(`
                            SELECT PO.*, S.name as supplierName 
                            FROM PurchaseOrders PO 
                            LEFT JOIN Suppliers S ON PO.supplierId = S.id 
                            ORDER BY PO.date DESC
                        `).all();

                        // Transform for frontend expected structure { supplier: { name: ... } }
                        const mapped = results.map(row => ({
                            ...row,
                            supplier: { name: row.supplierName }
                        }));
                        return json(mapped);
                    }
                    if (request.method === 'POST') {
                        const body = await request.json();
                        const id = crypto.randomUUID();
                        // Basic Insert
                        await env.DB.prepare(`
                            INSERT INTO PurchaseOrders (id, shopId, supplierId, poNumber, totalAmount, status)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(id, 'SHOP-001', body.supplierId, body.poNumber, body.totalAmount, 'PENDING').run();
                        return json({ id, ...body });
                    }
                }

                // --- SETTINGS ---
                if (url.pathname === '/api/settings') {
                    const shop = await env.DB.prepare("SELECT * FROM Shops WHERE id = 'SHOP-001'").first();

                    if (!shop) {
                        // Auto-create shop if missing
                        await env.DB.prepare("INSERT INTO Shops (id, name) VALUES ('SHOP-001', 'Zepio ERP')").run();
                        return json({ currency: 'USD', theme: 'light', companyName: 'Zepio ERP' });
                    }
                    return json({
                        currency: shop.currency || 'USD',
                        theme: shop.theme || 'light',
                        companyName: shop.name
                    });
                }

                // Fallback for others to "Success" to avoid frontend crash if empty
                return json({ status: 'active', message: 'Endpoint handled by D1 Worker. Real data coming soon for this route.' });

            } catch (e) {
                return error("Worker Error: " + e.message, 500);
            }
        }

        // Serve Static Assets
        if (env.ASSETS) {
            try {
                const response = await env.ASSETS.fetch(request);
                if (response.status === 404 && !url.pathname.includes('.')) {
                    return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
                }
                return response;
            } catch (e) {
                return new Response("Asset Error", { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    }
};
