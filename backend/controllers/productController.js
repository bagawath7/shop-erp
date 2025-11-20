const db = require('../database/db');

const productController = {
  // Get all products with SKUs
  getAllProducts: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          p.*,
          c.name as category_name,
          json_agg(
            json_build_object(
              'id', s.id,
              'sku_code', s.sku_code,
              'variant_name', s.variant_name,
              'cost_price', s.cost_price,
              'selling_price', s.selling_price,
              'tax_percentage', s.tax_percentage,
              'is_active', s.is_active,
              'inventory', json_build_object(
                'quantity', i.quantity,
                'minimum_stock_level', i.minimum_stock_level,
                'maximum_stock_level', i.maximum_stock_level
              )
            ) ORDER BY s.id
          ) FILTER (WHERE s.id IS NOT NULL) as skus
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN skus s ON p.id = s.product_id
        LEFT JOIN inventory i ON s.id = i.sku_id
        GROUP BY p.id, c.name
        ORDER BY p.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT
          p.*,
          c.name as category_name,
          json_agg(
            json_build_object(
              'id', s.id,
              'sku_code', s.sku_code,
              'variant_name', s.variant_name,
              'cost_price', s.cost_price,
              'selling_price', s.selling_price,
              'tax_percentage', s.tax_percentage,
              'is_active', s.is_active,
              'inventory', json_build_object(
                'quantity', i.quantity,
                'minimum_stock_level', i.minimum_stock_level,
                'maximum_stock_level', i.maximum_stock_level
              )
            ) ORDER BY s.id
          ) FILTER (WHERE s.id IS NOT NULL) as skus
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN skus s ON p.id = s.product_id
        LEFT JOIN inventory i ON s.id = i.sku_id
        WHERE p.id = $1
        GROUP BY p.id, c.name
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    const client = await db.pool.connect();
    try {
      const { name, description, category_id, skus } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Product name is required' });
      }

      await client.query('BEGIN');

      // Create product
      const productResult = await client.query(
        `INSERT INTO products (name, description, category_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description, category_id || null]
      );

      const product = productResult.rows[0];

      // Create SKUs if provided
      if (skus && skus.length > 0) {
        for (const sku of skus) {
          const skuResult = await client.query(
            `INSERT INTO skus (product_id, sku_code, variant_name, cost_price, selling_price, tax_percentage)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              product.id,
              sku.sku_code,
              sku.variant_name || null,
              sku.cost_price,
              sku.selling_price,
              sku.tax_percentage || 0,
            ]
          );

          // Create inventory record for SKU
          await client.query(
            `INSERT INTO inventory (sku_id, quantity, minimum_stock_level, maximum_stock_level)
             VALUES ($1, $2, $3, $4)`,
            [
              skuResult.rows[0].id,
              sku.initial_quantity || 0,
              sku.minimum_stock_level || 10,
              sku.maximum_stock_level || null,
            ]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch complete product with SKUs
      const completeProduct = await db.query(
        `SELECT
          p.*,
          c.name as category_name,
          json_agg(
            json_build_object(
              'id', s.id,
              'sku_code', s.sku_code,
              'variant_name', s.variant_name,
              'cost_price', s.cost_price,
              'selling_price', s.selling_price,
              'tax_percentage', s.tax_percentage,
              'is_active', s.is_active
            ) ORDER BY s.id
          ) FILTER (WHERE s.id IS NOT NULL) as skus
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN skus s ON p.id = s.product_id
        WHERE p.id = $1
        GROUP BY p.id, c.name`,
        [product.id]
      );

      res.status(201).json(completeProduct.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category_id } = req.body;

      const result = await db.query(
        `UPDATE products
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             category_id = $3
         WHERE id = $4
         RETURNING *`,
        [name, description, category_id || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = productController;
