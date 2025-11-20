const db = require('../database/db');

const categoryController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT c.*,
               p.name as parent_name,
               (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
        FROM categories c
        LEFT JOIN categories p ON c.parent_id = p.id
        ORDER BY c.name
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new category
  createCategory: async (req, res) => {
    try {
      const { name, description, parent_id } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const result = await db.query(
        `INSERT INTO categories (name, description, parent_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description, parent_id || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, parent_id } = req.body;

      const result = await db.query(
        `UPDATE categories
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             parent_id = $3
         WHERE id = $4
         RETURNING *`,
        [name, description, parent_id || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM categories WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

module.exports = categoryController;
