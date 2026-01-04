import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    ShoppingCart,
    BarChart3,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Store
} from 'lucide-react';

export default function LandingPage() {
    const { user, loading } = useAuth();

    // 1. Protection: If logged in, redirect to Dashboard
    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Store className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">ZEPIO</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="hidden sm:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-slate-200"
                            >
                                Get Started Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-white -z-10 pointer-events-none"></div>
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        New v2.0 Released
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        The Operating System <br className="hidden md:block" />
                        for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Modern Retail</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Manage inventory, sales, and analytics in real-time.
                        Stop guessing and start growing with the ERP built for speed and simplicity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-full font-bold text-lg transition-all"
                        >
                            Live Demo
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 animate-in fade-in duration-1000 delay-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>14-day free trial</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to run your shop.</h2>
                        <p className="text-lg text-slate-600">Powerful features wrapped in a beautiful interface.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast POS</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Process sales in seconds. Works offline, handles multiple payment methods, and syncs instantly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Analytics</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Know exactly how your business is performing. Track sales, profit, and growth trends daily.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Inventory</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Never run out of stock. Automatic low-stock alerts and dead stock analysis to optimize flow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-indigo-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to modernize your business?</h2>
                    <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
                        Join thousands of retailers who trust Zepio to power their daily operations.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors"
                    >
                        Get Started Now
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-indigo-500" />
                        <span className="font-bold text-lg text-white">ZEPIO</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <a href="#" className="hover:text-white transition-colors">Features</a>
                        <a href="#" className="hover:text-white transition-colors">Pricing</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Zepio ERP. Developed by MIDHUN SANIL.
                    </div>
                </div>
            </footer>
        </div>
    );
}
