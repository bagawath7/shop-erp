const db = require('../database/db');

const inventoryController = {
  // Get all inventory
  getAllInventory: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          i.*,
          s.sku_code,
          s.variant_name,
          s.selling_price,
          p.name as product_name,
          c.name as category_name,
          CASE
            WHEN i.quantity = 0 THEN 'OUT_OF_STOCK'
            WHEN i.quantity <= i.minimum_stock_level THEN 'LOW_STOCK'
            ELSE 'IN_STOCK'
          END as stock_status
        FROM inventory i
        JOIN skus s ON i.sku_id = s.id
        JOIN products p ON s.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY i.quantity ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get inventory by SKU ID
  getInventoryBySKU: async (req, res) => {
    try {
      const { sku_id } = req.params;
      const result = await db.query(`
        SELECT
          i.*,
          s.sku_code,
          s.variant_name,
          p.name as product_name
        FROM inventory i
        JOIN skus s ON i.sku_id = s.id
        JOIN products p ON s.product_id = p.id
        WHERE i.sku_id = $1
      `, [sku_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update inventory levels
  updateInventory: async (req, res) => {
    try {
      const { sku_id } = req.params;
      const { quantity, minimum_stock_level, maximum_stock_level } = req.body;

      const result = await db.query(
        `UPDATE inventory
         SET quantity = COALESCE($1, quantity),
             minimum_stock_level = COALESCE($2, minimum_stock_level),
             maximum_stock_level = COALESCE($3, maximum_stock_level)
         WHERE sku_id = $4
         RETURNING *`,
        [quantity, minimum_stock_level, maximum_stock_level, sku_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory not found' });
      }

      // Check for stock alerts
      const inventory = result.rows[0];
      if (inventory.quantity <= inventory.minimum_stock_level) {
        await db.query(
          `INSERT INTO stock_alerts (sku_id, alert_type, message)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [
            sku_id,
            inventory.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            `Stock level is ${inventory.quantity}`,
          ]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Add stock movement
  addStockMovement: async (req, res) => {
    const client = await db.pool.connect();
    try {
      const {
        sku_id,
        batch_id,
        movement_type,
        quantity,
        reference_number,
        notes,
      } = req.body;

      if (!sku_id || !movement_type || !quantity) {
        return res.status(400).json({
          error: 'SKU ID, movement type, and quantity are required',
        });
      }

      if (!['IN', 'OUT', 'ADJUSTMENT'].includes(movement_type)) {
        return res.status(400).json({
          error: 'Invalid movement type. Must be IN, OUT, or ADJUSTMENT',
        });
      }

      await client.query('BEGIN');

      // Record stock movement
      const movementResult = await client.query(
        `INSERT INTO stock_movements (sku_id, batch_id, movement_type, quantity, reference_number, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [sku_id, batch_id || null, movement_type, quantity, reference_number, notes]
      );

      // Update inventory quantity
      const quantityChange = movement_type === 'OUT' ? -quantity : quantity;
      const inventoryResult = await client.query(
        `UPDATE inventory
         SET quantity = quantity + $1
         WHERE sku_id = $2
         RETURNING *`,
        [quantityChange, sku_id]
      );

      if (inventoryResult.rows.length === 0) {
        throw new Error('Inventory not found');
      }

      // Check for stock alerts
      const inventory = inventoryResult.rows[0];
      if (inventory.quantity <= inventory.minimum_stock_level) {
        await client.query(
          `INSERT INTO stock_alerts (sku_id, alert_type, message)
           VALUES ($1, $2, $3)`,
          [
            sku_id,
            inventory.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            `Stock level is ${inventory.quantity} after ${movement_type} movement`,
          ]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        movement: movementResult.rows[0],
        inventory: inventoryResult.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding stock movement:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Get stock movements
  getStockMovements: async (req, res) => {
    try {
      const { sku_id } = req.query;

      let query = `
        SELECT
          sm.*,
          s.sku_code,
          p.name as product_name,
          ib.batch_number
        FROM stock_movements sm
        JOIN skus s ON sm.sku_id = s.id
        JOIN products p ON s.product_id = p.id
        LEFT JOIN inventory_batches ib ON sm.batch_id = ib.id
      `;

      const params = [];
      if (sku_id) {
        query += ' WHERE sm.sku_id = $1';
        params.push(sku_id);
      }

      query += ' ORDER BY sm.created_at DESC LIMIT 100';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get batches
  getBatches: async (req, res) => {
    try {
      const { sku_id } = req.query;

      let query = `
        SELECT
          ib.*,
          s.sku_code,
          p.name as product_name,
          CASE
            WHEN ib.expiry_date < CURRENT_DATE THEN 'EXPIRED'
            WHEN ib.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
            ELSE 'VALID'
          END as batch_status
        FROM inventory_batches ib
        JOIN skus s ON ib.sku_id = s.id
        JOIN products p ON s.product_id = p.id
      `;

      const params = [];
      if (sku_id) {
        query += ' WHERE ib.sku_id = $1';
        params.push(sku_id);
      }

      query += ' ORDER BY ib.expiry_date ASC';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create batch
  createBatch: async (req, res) => {
    try {
      const {
        sku_id,
        batch_number,
        quantity,
        manufacturing_date,
        expiry_date,
        received_date,
      } = req.body;

      if (!sku_id || !batch_number || !quantity) {
        return res.status(400).json({
          error: 'SKU ID, batch number, and quantity are required',
        });
      }

      const result = await db.query(
        `INSERT INTO inventory_batches (sku_id, batch_number, quantity, manufacturing_date, expiry_date, received_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          sku_id,
          batch_number,
          quantity,
          manufacturing_date || null,
          expiry_date || null,
          received_date || null,
        ]
      );

      // Check for expiring batches
      if (expiry_date) {
        const expiryDate = new Date(expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        if (expiryDate <= thirtyDaysFromNow) {
          await db.query(
            `INSERT INTO stock_alerts (sku_id, alert_type, message)
             VALUES ($1, $2, $3)`,
            [
              sku_id,
              'EXPIRING_SOON',
              `Batch ${batch_number} expires on ${expiry_date}`,
            ]
          );
        }
      }

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Batch number already exists for this SKU' });
      }
      console.error('Error creating batch:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get stock alerts
  getStockAlerts: async (req, res) => {
    try {
      const { is_resolved } = req.query;

      let query = `
        SELECT
          sa.*,
          s.sku_code,
          p.name as product_name,
          i.quantity as current_quantity
        FROM stock_alerts sa
        JOIN skus s ON sa.sku_id = s.id
        JOIN products p ON s.product_id = p.id
        LEFT JOIN inventory i ON s.id = i.sku_id
      `;

      const params = [];
      if (is_resolved !== undefined) {
        query += ' WHERE sa.is_resolved = $1';
        params.push(is_resolved === 'true');
      }

      query += ' ORDER BY sa.created_at DESC';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Resolve stock alert
  resolveStockAlert: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE stock_alerts
         SET is_resolved = true,
             resolved_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Stock alert not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error resolving stock alert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = inventoryController;
