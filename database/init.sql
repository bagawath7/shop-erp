-- Shop ERP Database Initialization Script
-- Run this after deploying to Render to set up the database schema

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create skus table (Stock Keeping Units)
CREATE TABLE IF NOT EXISTS skus (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku_code VARCHAR(100) UNIQUE NOT NULL,
    variant_name VARCHAR(255),
    purchase_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),
    barcode VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER REFERENCES skus(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    reorder_level INTEGER DEFAULT 10,
    max_stock_level INTEGER,
    location VARCHAR(255),
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, location)
);

-- Create inventory_batches table
CREATE TABLE IF NOT EXISTS inventory_batches (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    purchase_price DECIMAL(10, 2),
    manufacturing_date DATE,
    expiry_date DATE,
    supplier_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment', 'transfer', 'return'
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(100),
    reason TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'expiring_soon', 'expired'
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_skus_product_id ON skus(product_id);
CREATE INDEX IF NOT EXISTS idx_skus_sku_code ON skus(sku_code);
CREATE INDEX IF NOT EXISTS idx_skus_is_active ON skus(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_sku_id ON inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_inventory_id ON inventory_batches(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiry_date ON inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_id ON stock_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_inventory_id ON stock_alerts(inventory_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_resolved ON stock_alerts(is_resolved);

-- Insert sample data (optional - for demo purposes)
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic items and gadgets'),
    ('Clothing', 'Apparel and fashion items'),
    ('Food & Beverages', 'Consumable food and drink products')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
END $$;
