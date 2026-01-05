
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

            // Settings (required for dashboard load)
            if (url.pathname === '/api/settings' && request.method === 'GET') {
                return new Response(JSON.stringify({
                    currency: "USD",
                    theme: "light",
                    companyName: "Demo Company"
                }), { headers });
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
