import React from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    FileText,
    LogOut,
    Store,
    Settings as SettingsIcon,
    Menu,
    ChevronDown,
    Info
} from 'lucide-react';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = React.useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close mobile menu on navigation
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/billing', icon: ShoppingCart, label: 'Billing / POS' },
        { path: '/inventory', icon: Package, label: 'Products' },
        { path: '/inventory/suppliers', icon: Store, label: 'Suppliers' },
        { path: '/inventory/purchase-orders', icon: FileText, label: 'Purchase Orders' },
        { path: '/reports', icon: LayoutDashboard, label: 'Reports' },
        { path: '/settings', icon: SettingsIcon, label: 'Settings' },
        { path: '/about', icon: Info, label: 'About' },
    ];

    // Helper to determine if a route is active with strict rules
    const isRouteActive = (routePath) => {
        const currentPath = location.pathname;

        // Exact match always returns true (e.g. /dashboard)
        if (currentPath === routePath) return true;

        // Special handling for Inventory sub-routes
        if (routePath === '/inventory') {
            // Active for /inventory, /inventory/new, /inventory/:id but NOT /inventory/suppliers or /inventory/purchase-orders
            return (currentPath === '/inventory' ||
                currentPath === '/inventory/new' ||
                (currentPath.startsWith('/inventory/') &&
                    !currentPath.startsWith('/inventory/suppliers') &&
                    !currentPath.startsWith('/inventory/purchase-orders')));
        }

        // Standard "starts with" check for other nested routes (like suppliers, POs)
        // e.g. /inventory/suppliers should match /inventory/suppliers/new
        if (routePath !== '/dashboard' && routePath !== '/billing' && routePath !== '/settings' && routePath !== '/reports') {
            return currentPath.startsWith(routePath);
        }

        return false;
    };

    // Handle navigation click, including expanding sub-menus
    const handleNavClick = (item) => {
        if (item.subItems) {
            setExpandedMenu(expandedMenu === item.path ? null : item.path);
        } else {
            navigate(item.path);
            setIsMobileMenuOpen(false); // Close on selection
        }
    };

    return (
        <div className="min-h-screen bg-background flex relative">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-gray-900 text-white ${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col fixed h-full inset-y-0 z-50 print:hidden transition-transform duration-300 md:translate-x-0`}>
                <div className="p-6 border-b border-gray-800 flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-accent flex items-center justify-center font-bold text-white">Z</div>
                        <span className="text-xl font-bold tracking-tight">Zepio ERP</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <div className="sr-only">Close sidebar</div>
                        <ChevronDown className="h-6 w-6 rotate-90" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isRouteActive(item.path);
                        return (
                            <div key={item.path}>
                                <div
                                    onClick={() => handleNavClick(item)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all cursor-pointer mb-1
                                        ${active
                                            ? 'bg-accent text-white shadow-md'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                                    {item.label}
                                    {item.subItems && (
                                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${expandedMenu === item.path ? 'rotate-180' : ''}`} />
                                    )}
                                </div>
                                {/* Submenu */}
                                {item.subItems && (expandedMenu === item.path || active) && (
                                    <div className="ml-12 space-y-1 mb-2 border-l border-gray-700 pl-2 animate-in slide-in-from-left-2 duration-200">
                                        {item.subItems.map(sub => (
                                            <Link
                                                key={sub.path}
                                                to={sub.path}
                                                className={`block px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === sub.path
                                                    ? 'text-white font-medium bg-gray-800'
                                                    : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-lg">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Logout">
                            <LogOut className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 bg-background min-h-screen flex flex-col relative transition-all duration-300 ease-in-out">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-border p-4 flex items-center justify-between sticky top-0 z-40 print:hidden">
                    <div className="flex items-center gap-2 font-bold text-primary">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">Z</div>
                        Zepio
                    </div>
                    <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>
                {/* Demo Banner */}
                {user?.isDemo && (
                    <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-medium text-center shadow-md relative z-40">
                        THIS IS A DEMO MODE AND SOME FUNCTIONS MAY NOT WORK,IT IS FOR DEMO USE PURPOSE
                    </div>
                )}
                <div className="p-8 pb-16">
                    <Outlet />
                </div>

                {/* Global Watermark Footer */}
                <div className="fixed bottom-0 right-0 left-64 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-2 px-6 flex justify-between items-center z-30 text-xs text-gray-500">
                    <span>&copy; {new Date().getFullYear()} Zepio ERP</span>
                    <span className="font-semibold tracking-wide">Developed by MIDHUN SANIL</span>
                </div>
            </main>
        </div>
    );
}
