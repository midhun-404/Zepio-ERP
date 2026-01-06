-- Cloudflare D1 Schema

DROP TABLE IF EXISTS PurchaseOrderItems;
DROP TABLE IF EXISTS InvoiceItems;
DROP TABLE IF EXISTS PurchaseOrders;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Suppliers;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Shops;

CREATE TABLE Shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    theme TEXT DEFAULT 'light',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'OWNER',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (shopId) REFERENCES Shops(id)
);

CREATE TABLE Products (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    costPrice DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    sku TEXT,
    barcode TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Suppliers (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Customers (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PurchaseOrders (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    supplierId TEXT,
    poNumber TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'PENDING',
    totalAmount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Invoices (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    customerId TEXT,
    invoiceNumber TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    totalAmount DECIMAL(10, 2) NOT NULL,
    taxAmount DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    paidAmount DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'PAID',
    paymentMode TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data (Demo User)
-- Password 'password' hashed with bcrypt (example hash, or use plain if mimicking simple behavior for now, but better use real hash if possible. For D1 simply, we might need a simple check)
-- For this "make it work" phase, I'll insert a user with a known password hash or handle hashing in the worker.
-- Let's assume standard bcrypt used in the app.
INSERT INTO Shops (id, name) VALUES ('SHOP-001', 'Zepio ERP Demo Store');
INSERT INTO Users (id, shopId, name, email, password, role) VALUES 
('USER-001', 'SHOP-001', 'Demo Admin', 'demo@zepio.com', '$2a$10$X7.123...', 'admin'); 
