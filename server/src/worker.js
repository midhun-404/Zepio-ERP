
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

        // API routes - placeholder for future backend integration
        if (url.pathname.startsWith('/api')) {
            return new Response(JSON.stringify({
                status: 'Backend Work in Progress',
                message: 'The Express backend is currently disabled for checking deployment stability.'
            }), {
                status: 200, // Returning 200 so frontend doesn't crash strictly
                headers: { 'Content-Type': 'application/json' }
            });
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
