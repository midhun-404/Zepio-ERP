/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1F2937',   // Gray 900
                secondary: '#374151', // Gray 700
                accent: '#2563EB',    // Blue 600
                success: '#16A34A',
                warning: '#D97706',
                danger: '#DC2626',
                background: '#F9FAFB',
                card: '#FFFFFF',
                muted: '#6B7280',
                border: '#E5E7EB',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            container: {
                center: true,
                padding: '1rem',
            },
        },
    },
    plugins: [],
}
