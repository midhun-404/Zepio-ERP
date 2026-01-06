-- Add InvoiceItems table
CREATE TABLE InvoiceItems (
    id TEXT PRIMARY KEY,
    invoiceId TEXT NOT NULL,
    productId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (invoiceId) REFERENCES Invoices(id),
    -- FOREIGN KEY (productId) REFERENCES Products(id)
);

-- Add PurchaseOrderItems table
CREATE TABLE PurchaseOrderItems (
    id TEXT PRIMARY KEY,
    purchaseOrderId TEXT NOT NULL,
    productId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitCost DECIMAL(10, 2) NOT NULL,
    totalCost DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (purchaseOrderId) REFERENCES PurchaseOrders(id),
    -- FOREIGN KEY (productId) REFERENCES Products(id)
);
