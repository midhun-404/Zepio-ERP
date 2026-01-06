var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// server/src/worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const json = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers: corsHeaders }), "json");
    const error = /* @__PURE__ */ __name((msg, status = 500) => new Response(JSON.stringify({ error: msg, success: false }), { status, headers: corsHeaders }), "error");
    if (url.pathname.startsWith("/api")) {
      try {
        if (url.pathname === "/api/auth/login" && request.method === "POST") {
          const { email, password } = await request.json();
          const user = await env.DB.prepare("SELECT * FROM Users WHERE email = ?").bind(email).first();
          if (!user) {
            return error("User not found", 404);
          }
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
        if (url.pathname === "/api/auth/signup" && request.method === "POST") {
          const body = await request.json();
          const id = crypto.randomUUID();
          const shopId = "SHOP-001";
          try {
            await env.DB.prepare(
              "INSERT INTO Users (id, shopId, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(id, shopId, body.fullName, body.email, body.password, "user").run();
            return json({
              success: true,
              token: "d1-token-" + Date.now(),
              user: { id, name: body.fullName, email: body.email, role: "user" }
            });
          } catch (e) {
            return error("Email likely already exists: " + e.message, 400);
          }
        }
        if (url.pathname === "/api/reports/dashboard") {
          const salesStats = await env.DB.prepare(`
                        SELECT 
                            SUM(totalAmount) as total, 
                            COUNT(*) as count, 
                            AVG(totalAmount) as average 
                        FROM Invoices WHERE status = 'PAID'
                    `).first();
          const pending = await env.DB.prepare("SELECT SUM(totalAmount - paidAmount) as val FROM Invoices WHERE status != 'PAID'").first();
          const sales = {
            total: salesStats.total || 0,
            count: salesStats.count || 0,
            average: salesStats.average || 0
          };
          const recentSalesData = await env.DB.prepare("SELECT * FROM Invoices ORDER BY date DESC LIMIT 5").all();
          const recentSales = recentSalesData.results.map((inv) => ({
            id: inv.id,
            date: inv.date,
            totalAmount: inv.totalAmount,
            status: inv.status,
            customer: { name: "Valued Customer" }
            // Join needed normally
          }));
          return json({
            sales,
            pendingPayments: pending.val || 0,
            lowStock: { count: 0, items: [] },
            // TODO
            healthScore: 95,
            recentSales,
            topProducts: [],
            deadStock: { data: [] },
            monthlyRevenue: [0, 0, 0, 0, 0, 0, sales.total]
            // Mock array for chart
          });
        }
        if (url.pathname === "/api/products") {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM Products ORDER BY createdAt DESC").all();
            return json(results);
          }
          if (request.method === "POST") {
            const body = await request.json();
            const id = crypto.randomUUID();
            await env.DB.prepare(`
                            INSERT INTO Products (id, shopId, name, price, stock, category, sku, description)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(id, "SHOP-001", body.name, body.price, body.stock, body.category, body.sku, body.description).run();
            return json({ id, ...body });
          }
        }
        if (url.pathname.match(/\/api\/products\/.+/) && request.method === "DELETE") {
          const pid = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM Products WHERE id = ?").bind(pid).run();
          return json({ success: true });
        }
        if (url.pathname === "/api/invoices") {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM Invoices ORDER BY date DESC").all();
            return json(results);
          }
          if (request.method === "POST") {
            const body = await request.json();
            const id = crypto.randomUUID();
            await env.DB.prepare(`
                            INSERT INTO Invoices (id, shopId, invoiceNumber, customerId, totalAmount, status, date)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `).bind(id, "SHOP-001", body.invoiceNumber || "INV-" + Date.now(), null, body.totalAmount, body.status, (/* @__PURE__ */ new Date()).toISOString()).run();
            return json({ id, ...body });
          }
        }
        if (url.pathname === "/api/suppliers") {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare("SELECT * FROM Suppliers").all();
            return json(results);
          }
          if (request.method === "POST") {
            const body = await request.json();
            const id = crypto.randomUUID();
            await env.DB.prepare("INSERT INTO Suppliers (id, shopId, name, email, phone) VALUES (?, ?, ?, ?, ?)").bind(id, "SHOP-001", body.name, body.email, body.phone).run();
            return json({ id, ...body });
          }
        }
        if (url.pathname === "/api/settings") {
          const shop = await env.DB.prepare("SELECT * FROM Shops WHERE id = 'SHOP-001'").first();
          if (!shop) {
            await env.DB.prepare("INSERT INTO Shops (id, name) VALUES ('SHOP-001', 'Zepio ERP')").run();
            return json({ currency: "USD", theme: "light", companyName: "Zepio ERP" });
          }
          return json({
            currency: shop.currency || "USD",
            theme: shop.theme || "light",
            companyName: shop.name
          });
        }
        return json({ status: "active", message: "Endpoint handled by D1 Worker. Real data coming soon for this route." });
      } catch (e) {
        return error("Worker Error: " + e.message, 500);
      }
    }
    if (env.ASSETS) {
      try {
        const response = await env.ASSETS.fetch(request);
        if (response.status === 404 && !url.pathname.includes(".")) {
          return await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
        }
        return response;
      } catch (e) {
        return new Response("Asset Error", { status: 500 });
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
