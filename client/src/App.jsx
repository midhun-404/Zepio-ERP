import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import LandingPage from './pages/LandingPage';

import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';

import ProductList from './pages/inventory/ProductList';
import ProductForm from './pages/inventory/ProductForm';

import POS from './pages/billing/POS';
import Reports from './pages/reports/Reports';
import Settings from './pages/Settings';
import About from './pages/About';

import SupplierList from './pages/inventory/SupplierList';
import PurchaseOrderList from './pages/inventory/PurchaseOrderList';
import PurchaseOrderForm from './pages/inventory/PurchaseOrderForm';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import DemoNotice from './components/common/DemoNotice';

function App() {
  return (
    <BrowserRouter>
      <DemoNotice />

      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/inventory" element={<ProductList />} />
            <Route path="/inventory/new" element={<ProductForm />} />
            <Route path="/inventory/suppliers" element={<SupplierList />} />
            <Route path="/inventory/purchase-orders" element={<PurchaseOrderList />} />
            <Route path="/inventory/purchase-orders/new" element={<PurchaseOrderForm />} />

            <Route path="/billing" element={<POS />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Route>

          <Route path="/" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
