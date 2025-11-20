-- Shop ERP Mock Data
-- Run this after init.sql to populate the database with sample data

-- Insert Categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Apparel and fashion items'),
    ('Food & Beverages', 'Consumable food and drink products'),
    ('Books', 'Books, magazines, and publications'),
    ('Home & Kitchen', 'Home appliances and kitchen items'),
    ('Sports', 'Sports equipment and accessories'),
    ('Toys', 'Toys and games for children'),
    ('Beauty', 'Beauty and personal care products')
ON CONFLICT (name) DO NOTHING;

-- Insert Products
INSERT INTO products (name, description, category_id) VALUES
    ('Samsung Galaxy S23', 'Latest flagship smartphone', 1),
    ('Apple MacBook Pro', '16-inch laptop with M2 chip', 1),
    ('Sony WH-1000XM5', 'Noise-cancelling wireless headphones', 1),
    ('Mens Cotton T-Shirt', 'Comfortable cotton t-shirt', 2),
    ('Womens Denim Jeans', 'Classic blue denim jeans', 2),
    ('Coffee Beans - Premium Blend', 'Arabica coffee beans 1kg', 3),
    ('Organic Green Tea', 'Premium organic green tea 100g', 3),
    ('The Great Gatsby', 'Classic American novel', 4),
    ('Cooking Made Easy', 'Cookbook for beginners', 4),
    ('Air Fryer', '5L capacity digital air fryer', 5),
    ('Blender Pro', 'High-speed blender 1000W', 5),
    ('Yoga Mat', 'Non-slip exercise yoga mat', 6),
    ('Tennis Racket', 'Professional tennis racket', 6),
    ('LEGO City Set', 'Building blocks set 500 pieces', 7),
    ('Board Game - Strategy', 'Family strategy board game', 7),
    ('Moisturizing Cream', 'Daily face moisturizer 50ml', 8),
    ('Shampoo - Herbal', 'Natural herbal shampoo 250ml', 8);

-- Insert SKUs
INSERT INTO skus (product_id, sku_code, variant_name, cost_price, selling_price, tax_percentage) VALUES
    (1, 'SAM-S23-BLK-128', 'Black 128GB', 650.00, 799.99, 18.00),
    (1, 'SAM-S23-WHT-128', 'White 128GB', 650.00, 799.99, 18.00),
    (1, 'SAM-S23-BLK-256', 'Black 256GB', 750.00, 899.99, 18.00),
    (2, 'APP-MBP-16-M2-512', 'Space Gray 512GB SSD', 1800.00, 2399.99, 18.00),
    (2, 'APP-MBP-16-M2-1TB', 'Space Gray 1TB SSD', 2100.00, 2699.99, 18.00),
    (3, 'SNY-WH1000XM5-BLK', 'Black', 280.00, 349.99, 18.00),
    (3, 'SNY-WH1000XM5-SLV', 'Silver', 280.00, 349.99, 18.00),
    (4, 'TSH-MEN-BLK-M', 'Black Medium', 8.00, 19.99, 12.00),
    (4, 'TSH-MEN-BLK-L', 'Black Large', 8.00, 19.99, 12.00),
    (4, 'TSH-MEN-WHT-M', 'White Medium', 8.00, 19.99, 12.00),
    (5, 'JNS-WMN-BLU-28', 'Blue Size 28', 25.00, 49.99, 12.00),
    (5, 'JNS-WMN-BLU-30', 'Blue Size 30', 25.00, 49.99, 12.00),
    (6, 'COF-PREM-1KG', '1 Kg Pack', 15.00, 24.99, 5.00),
    (7, 'TEA-GRN-ORG-100G', '100g Pack', 8.00, 14.99, 5.00),
    (8, 'BOOK-GG-HB', 'Hardback', 8.00, 15.99, 0.00),
    (8, 'BOOK-GG-PB', 'Paperback', 5.00, 9.99, 0.00),
    (9, 'BOOK-CME-PB', 'Paperback', 12.00, 22.99, 0.00),
    (10, 'AIRFRY-5L-BLK', 'Black', 45.00, 79.99, 18.00),
    (11, 'BLND-1000W-RED', 'Red', 55.00, 89.99, 18.00),
    (12, 'YOGA-MAT-BLU', 'Blue', 12.00, 24.99, 12.00),
    (12, 'YOGA-MAT-PNK', 'Pink', 12.00, 24.99, 12.00),
    (13, 'TEN-RKT-PRO', 'Professional', 85.00, 139.99, 18.00),
    (14, 'LEGO-CITY-500', '500 pieces', 35.00, 59.99, 12.00),
    (15, 'GAME-STRAT-FAM', 'Family Edition', 18.00, 34.99, 12.00),
    (16, 'MOIST-FACE-50ML', '50ml', 15.00, 29.99, 12.00),
    (17, 'SHAMP-HERB-250ML', '250ml', 6.00, 12.99, 12.00);

-- Insert Inventory
INSERT INTO inventory (sku_id, quantity, minimum_stock_level, maximum_stock_level) VALUES
    (1, 25, 10, 100),
    (2, 15, 10, 100),
    (3, 8, 5, 50),
    (4, 5, 3, 30),
    (5, 3, 3, 30),
    (6, 45, 15, 150),
    (7, 38, 15, 150),
    (8, 120, 20, 300),
    (9, 95, 20, 300),
    (10, 88, 20, 300),
    (11, 65, 15, 200),
    (12, 52, 15, 200),
    (13, 180, 30, 500),
    (14, 210, 40, 600),
    (15, 42, 10, 100),
    (16, 55, 10, 100),
    (17, 38, 10, 100),
    (18, 28, 8, 80),
    (19, 22, 8, 80),
    (20, 145, 25, 400),
    (21, 132, 25, 400),
    (22, 18, 5, 50),
    (23, 48, 12, 120),
    (24, 75, 20, 200),
    (25, 168, 30, 500),
    (26, 245, 50, 800);

-- Insert Inventory Batches
INSERT INTO inventory_batches (sku_id, batch_number, quantity, manufacturing_date, expiry_date) VALUES
    (1, 'SAM-S23-BLK-128-B001', 25, '2024-10-15', NULL),
    (2, 'SAM-S23-WHT-128-B001', 15, '2024-10-15', NULL),
    (3, 'SAM-S23-BLK-256-B001', 8, '2024-10-20', NULL),
    (6, 'SNY-WH-B001', 45, '2024-09-10', NULL),
    (7, 'SNY-WH-B002', 38, '2024-09-10', NULL),
    (13, 'COF-PREM-B001', 100, '2024-11-01', '2025-11-01'),
    (13, 'COF-PREM-B002', 80, '2024-11-10', '2025-11-10'),
    (14, 'TEA-GRN-B001', 120, '2024-10-15', '2025-10-15'),
    (14, 'TEA-GRN-B002', 90, '2024-11-05', '2025-11-05'),
    (18, 'AIRFRY-B001', 28, '2024-08-20', NULL),
    (19, 'BLND-B001', 22, '2024-08-25', NULL),
    (25, 'MOIST-B001', 90, '2024-09-01', '2025-09-01'),
    (25, 'MOIST-B002', 78, '2024-10-01', '2025-10-01'),
    (26, 'SHAMP-B001', 150, '2024-08-15', '2026-08-15'),
    (26, 'SHAMP-B002', 95, '2024-09-20', '2026-09-20');

-- Insert Stock Movements
INSERT INTO stock_movements (sku_id, batch_id, movement_type, quantity, reference_number, notes) VALUES
    (1, 1, 'IN', 25, 'PO-2024-001', 'Initial stock purchase'),
    (2, 2, 'IN', 15, 'PO-2024-001', 'Initial stock purchase'),
    (6, 4, 'IN', 50, 'PO-2024-002', 'Bulk purchase'),
    (6, 4, 'OUT', 5, 'SO-2024-001', 'Customer order'),
    (13, 6, 'IN', 100, 'PO-2024-003', 'Coffee beans stock'),
    (13, 7, 'IN', 80, 'PO-2024-004', 'Coffee beans restock'),
    (14, 8, 'IN', 120, 'PO-2024-005', 'Tea stock'),
    (14, 8, 'OUT', 10, 'SO-2024-002', 'Retail sale'),
    (18, 10, 'IN', 30, 'PO-2024-006', 'Air fryer purchase'),
    (18, 10, 'OUT', 2, 'SO-2024-003', 'Online order'),
    (25, 11, 'IN', 90, 'PO-2024-007', 'Beauty products'),
    (25, 12, 'IN', 78, 'PO-2024-008', 'Beauty restock'),
    (26, 13, 'IN', 150, 'PO-2024-009', 'Shampoo bulk order'),
    (26, 14, 'IN', 95, 'PO-2024-010', 'Shampoo restock');

-- Insert Stock Alerts (Low stock warnings)
INSERT INTO stock_alerts (sku_id, alert_type, message, is_resolved) VALUES
    (3, 'LOW_STOCK', 'Samsung Galaxy S23 Black 256GB is running low (8 units remaining)', false),
    (4, 'LOW_STOCK', 'Apple MacBook Pro 512GB is below minimum stock level', false),
    (5, 'LOW_STOCK', 'Apple MacBook Pro 1TB is at minimum stock level', false);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Mock data inserted successfully!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - 8 Categories';
    RAISE NOTICE '  - 17 Products';
    RAISE NOTICE '  - 26 SKUs';
    RAISE NOTICE '  - 26 Inventory records';
    RAISE NOTICE '  - 15 Inventory batches';
    RAISE NOTICE '  - 14 Stock movements';
    RAISE NOTICE '  - 3 Stock alerts';
    RAISE NOTICE '===========================================';
END $$;
