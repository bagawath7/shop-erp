const db = require('../database/db');

const skuController = {
  // Get all SKUs
  getAllSKUs: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          s.*,
          p.name as product_name,
          p.description as product_description,
          c.name as category_name,
          i.quantity,
          i.minimum_stock_level,
          i.maximum_stock_level
        FROM skus s
        JOIN products p ON s.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN inventory i ON s.id = i.sku_id
        ORDER BY s.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get SKU by ID
  getSKUById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT
          s.*,
          p.name as product_name,
          p.description as product_description,
          c.name as category_name,
          i.quantity,
          i.minimum_stock_level,
          i.maximum_stock_level
        FROM skus s
        JOIN products p ON s.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN inventory i ON s.id = i.sku_id
        WHERE s.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'SKU not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching SKU:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new SKU
  createSKU: async (req, res) => {
    const client = await db.pool.connect();
    try {
      const {
        product_id,
        sku_code,
        variant_name,
        cost_price,
        selling_price,
        tax_percentage,
        initial_quantity,
        minimum_stock_level,
        maximum_stock_level,
      } = req.body;

      if (!product_id || !sku_code || cost_price === undefined || selling_price === undefined) {
        return res.status(400).json({
          error: 'Product ID, SKU code, cost price, and selling price are required',
        });
      }

      await client.query('BEGIN');

      // Create SKU
      const skuResult = await client.query(
        `INSERT INTO skus (product_id, sku_code, variant_name, cost_price, selling_price, tax_percentage)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [product_id, sku_code, variant_name || null, cost_price, selling_price, tax_percentage || 0]
      );

      const sku = skuResult.rows[0];

      // Create inventory record
      await client.query(
        `INSERT INTO inventory (sku_id, quantity, minimum_stock_level, maximum_stock_level)
         VALUES ($1, $2, $3, $4)`,
        [sku.id, initial_quantity || 0, minimum_stock_level || 10, maximum_stock_level || null]
      );

      await client.query('COMMIT');

      res.status(201).json(sku);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        return res.status(400).json({ error: 'SKU code already exists' });
      }
      console.error('Error creating SKU:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Update SKU
  updateSKU: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        sku_code,
        variant_name,
        cost_price,
        selling_price,
        tax_percentage,
        is_active,
      } = req.body;

      const result = await db.query(
        `UPDATE skus
         SET sku_code = COALESCE($1, sku_code),
             variant_name = COALESCE($2, variant_name),
             cost_price = COALESCE($3, cost_price),
             selling_price = COALESCE($4, selling_price),
             tax_percentage = COALESCE($5, tax_percentage),
             is_active = COALESCE($6, is_active)
         WHERE id = $7
         RETURNING *`,
        [sku_code, variant_name, cost_price, selling_price, tax_percentage, is_active, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'SKU not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating SKU:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete SKU
  deleteSKU: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM skus WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'SKU not found' });
      }

      res.json({ message: 'SKU deleted successfully' });
    } catch (error) {
      console.error('Error deleting SKU:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = skuController;
