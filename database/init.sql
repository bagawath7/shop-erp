-- Shop ERP Database Schema

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SKUs (Stock Keeping Units) Table
CREATE TABLE IF NOT EXISTS skus (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_code VARCHAR(50) NOT NULL UNIQUE,
    variant_name VARCHAR(100),
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    tax_percentage DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 10,
    maximum_stock_level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id)
);

-- Inventory Batches Table
CREATE TABLE IF NOT EXISTS inventory_batches (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    received_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_number, sku_id)
);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES inventory_batches(id) ON DELETE SET NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    reference_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Alerts Table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    sku_id INTEGER NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON')),
    message TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_skus_product ON skus(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_batches_sku ON inventory_batches(sku_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_sku ON stock_movements(sku_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_sku ON stock_alerts(sku_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_unresolved ON stock_alerts(is_resolved) WHERE is_resolved = false;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skus_updated_at ON skus;
CREATE TRIGGER update_skus_updated_at BEFORE UPDATE ON skus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_batches_updated_at ON inventory_batches;
CREATE TRIGGER update_inventory_batches_updated_at BEFORE UPDATE ON inventory_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for demo purposes)
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic items and gadgets'),
    ('Clothing', 'Apparel and fashion items'),
    ('Food & Beverages', 'Consumable food and drink products')
ON CONFLICT (name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
END $$;
