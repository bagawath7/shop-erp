# Shop ERP System

A comprehensive ERP system for shop management with features for product management, SKU tracking, inventory management, and stock alerts.

## Features

### Product Management
- Create, update, and delete products
- Organize products by categories
- Support for hierarchical categories
- Track multiple SKUs per product

### SKU Management
- Unique SKU codes for each product variant
- Cost price and selling price tracking
- Tax percentage calculation
- Automatic profit margin calculation
- Active/inactive status for SKUs

### Inventory Management
- Real-time stock level tracking
- Minimum and maximum stock level alerts
- Stock movement tracking (IN, OUT, ADJUSTMENT)
- Batch/lot tracking with expiry dates
- Automatic stock alerts for low stock and out of stock items

### Stock Alerts
- Automated alerts for low stock levels
- Out of stock notifications
- Expiring batch alerts
- Alert resolution tracking

## Technology Stack

### Backend
- Node.js with Express
- PostgreSQL database
- RESTful API architecture

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb shop_erp
```

2. Run the database schema:
```bash
psql -d shop_erp -f backend/database/schema.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shop_erp
DB_USER=your_username
DB_PASSWORD=your_password
```

5. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend application will be available at `http://localhost:3000`

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products
- `GET /api/products` - Get all products with SKUs
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### SKUs
- `GET /api/skus` - Get all SKUs
- `GET /api/skus/:id` - Get SKU by ID
- `POST /api/skus` - Create new SKU
- `PUT /api/skus/:id` - Update SKU
- `DELETE /api/skus/:id` - Delete SKU

### Inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:sku_id` - Get inventory by SKU
- `PUT /api/inventory/:sku_id` - Update inventory levels
- `POST /api/inventory/movements` - Add stock movement
- `GET /api/inventory/movements/list` - Get stock movements
- `GET /api/inventory/batches/list` - Get batches
- `POST /api/inventory/batches` - Create batch
- `GET /api/inventory/alerts/list` - Get stock alerts
- `PUT /api/inventory/alerts/:id/resolve` - Resolve stock alert

## Database Schema

### Tables
- **categories** - Product categories with hierarchical support
- **products** - Main product information
- **skus** - Stock Keeping Units with pricing information
- **inventory** - Current stock levels for each SKU
- **inventory_batches** - Batch/lot tracking with expiry dates
- **stock_movements** - Historical record of all stock movements
- **stock_alerts** - Automated alerts for stock issues

## Usage Guide

### Adding a Product

1. Go to the Products page
2. Click "Add New Product"
3. Fill in product details (name, description, category)
4. Add one or more SKUs with pricing information
5. Set initial stock quantities and minimum stock levels
6. Click "Create Product"

### Managing Inventory

1. Go to the Inventory page
2. View current stock levels for all SKUs
3. Click "Add Stock Movement" to record stock in/out
4. Click "Add Batch" to create batch records with expiry dates
5. Monitor stock status indicators (In Stock, Low Stock, Out of Stock)

### Handling Stock Alerts

1. Go to the Stock Alerts page
2. View all unresolved alerts
3. Take action on low stock or expiring items
4. Click "Resolve" to mark alerts as handled
5. Switch to "Resolved" tab to view alert history

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/build` directory.

## Future Enhancements

- User authentication and authorization
- Sales order management
- Purchase order management
- Supplier management
- Reports and analytics
- Barcode scanning
- Multi-warehouse support
- Invoice generation
- Payment tracking

## License

ISC

## Author

Shop ERP Development Team
