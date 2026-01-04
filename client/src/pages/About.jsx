import React from 'react';
import { Info, CheckCircle, AlertTriangle, ExternalLink, Palette, Briefcase } from 'lucide-react';

export default function About() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary">About Zepio ERP</h1>
                <p className="text-xl text-muted text-center max-w-2xl mx-auto">
                    A comprehensive demonstration of modern Enterprise Resource Planning software.
                </p>
            </div>

            {/* Demo Notice Card */}
            <div className="card bg-indigo-50 border-indigo-100 p-8 border-l-4 border-l-indigo-600 shadow-sm">
                <div className="flex items-start gap-4">
                    <Info className="h-8 w-8 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900 mb-2">Demo Environment</h2>
                        <p className="text-indigo-800 leading-relaxed">
                            Welcome to the live demonstration of Zepio ERP. This platform is designed to showcase the capabilities of a modern web-based business management system.
                            Please note that this is a <strong>sandbox environment</strong> intended for testing and evaluation purposes only.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Features */}
                <div className="card bg-white p-6 border border-border shadow-sm h-full">
                    <h3 className="text-lg font-bold flex items-center mb-4 text-gray-900">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Key Features
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'Real-time Dashboard Analytics',
                            'Point of Sale (POS) & Billing',
                            'Inventory Management with Low Stock Alerts',
                            'Supplier & Purchase Order System',
                            'Comprehensive Sales Reports',
                            'Multi-currency Support',
                            'Customizable Invoice & Receipt Settings'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                                <span className="mr-2 text-green-500">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Limitations */}
                <div className="card bg-white p-6 border border-border shadow-sm h-full">
                    <h3 className="text-lg font-bold flex items-center mb-4 text-gray-900">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                        Important Points & Limitations
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'Data Persistence: Data may reset daily.',
                            'Email Service: Emails are simulated (no real sending).',
                            'Payment Gateway: Simulation mode only (no real charges).',
                            'Security: Do not upload sensitive personal data.',
                            'Performance: Optimized for demo traffic loads.'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                                <span className="mr-2 text-amber-500">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Customization Services */}
            <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-xl shadow-lg transform hover:scale-[1.01] transition-transform">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-white/10 p-4 rounded-full">
                        <Palette className="h-8 w-8 text-yellow-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-3">Need a Custom Solution?</h2>
                        <p className="text-blue-100 leading-relaxed text-lg mb-4">
                            This software is fully customizable to fit your unique business ecosystem.
                            As the developer, I offer bespoke modification services at the time of purchase:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-medium">
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Custom Branding & Themes</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> Workflow Adjustments</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> New Feature Integration</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-400" /> API & 3rd Party Connections</div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <p className="flex items-center text-yellow-300 font-semibold">
                                <Briefcase className="h-5 w-5 mr-2" />
                                Available for Freelance Projects & Customization - Contact for details.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Details */}
            <div className="card bg-gray-900 text-white p-8 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Technical Stack</h3>
                        <p className="text-gray-400 mb-4">Built with cutting-edge web technologies for performance and scalability.</p>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'SQLite', 'Sequelize'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-800 rounded-full text-xs font-mono text-cyan-400 border border-gray-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-muted pt-8">
                <p>Developed by <strong>MIDHUN SANIL</strong></p>
                <p className="mt-1">&copy; {new Date().getFullYear()} Zepio ERP. All rights reserved.</p>
            </div>
        </div>
    );
}
