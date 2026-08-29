import { pool } from '../server.js';

// Get tasks by category
export async function getTasksByCategory(req, res) {
  try {
    const { categoryId } = req.params;
    
    const result = await pool.query(
      `SELECT t.*, 
              COALESCE(array_agg(td.successor_task_id) FILTER (WHERE td.successor_task_id IS NOT NULL), '{}') as successor_ids,
              COALESCE(array_agg(tp.predecessor_task_id) FILTER (WHERE tp.predecessor_task_id IS NOT NULL), '{}') as predecessor_ids
       FROM tasks t
       LEFT JOIN task_dependencies td ON t.id = td.predecessor_task_id
       LEFT JOIN task_dependencies tp ON t.id = tp.successor_task_id
       WHERE t.category_id = $1
       GROUP BY t.id
       ORDER BY t.position`,
      [categoryId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// Get task with dependencies
export async function getTaskWithDependencies(req, res) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT t.*, 
              array_agg(DISTINCT td.successor_task_id) FILTER (WHERE td.successor_task_id IS NOT NULL) as successors,
              array_agg(DISTINCT tp.predecessor_task_id) FILTER (WHERE tp.predecessor_task_id IS NOT NULL) as predecessors
       FROM tasks t
       LEFT JOIN task_dependencies td ON t.id = td.predecessor_task_id
       LEFT JOIN task_dependencies tp ON t.id = tp.successor_task_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch task dependencies' });
  }
}

// Create new task
export async function createTask(req, res) {
  try {
    const { categoryId, name, description, startDay, duration, buffer, completed, position } = req.body;
    
    const result = await pool.query(
      `INSERT INTO tasks (category_id, name, description, start_day, duration, buffer, completed, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [categoryId, name, description || null, startDay || 0, duration || 1, buffer || 0, completed || false, position || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// Update task
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { name, description, startDay, duration, buffer, completed, position } = req.body;
    
    const result = await pool.query(
      `UPDATE tasks
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           start_day = COALESCE($3, start_day),
           duration = COALESCE($4, duration),
           buffer = COALESCE($5, buffer),
           completed = COALESCE($6, completed),
           position = COALESCE($7, position),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, startDay, duration, buffer, completed, position, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

// Delete task
export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    
    // First, delete any dependencies involving this task
    await pool.query(
      'DELETE FROM task_dependencies WHERE predecessor_task_id = $1 OR successor_task_id = $2',
      [id, id]
    );
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

// Add task dependency
export async function addTaskDependency(req, res) {
  try {
    const { id } = req.params;
    const { successorTaskId, dependencyType, lagDays } = req.body;
    
    // Validate that both tasks exist
    const tasksExist = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 OR id = $2',
      [id, successorTaskId]
    );
    
    if (tasksExist.rows.length !== 2) {
      return res.status(404).json({ error: 'One or both tasks not found' });
    }
    
    // Prevent circular dependencies (simple check)
    if (id === successorTaskId) {
      return res.status(400).json({ error: 'A task cannot depend on itself' });
    }
    
    const result = await pool.query(
      `INSERT INTO task_dependencies (predecessor_task_id, successor_task_id, dependency_type, lag_days)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [id, successorTaskId, dependencyType || 'FS', lagDays || 0]
    );
    
    // Update the predecessor and successor arrays in the tasks table
    await pool.query(
      `UPDATE tasks SET successor_ids = array_append(successor_ids, $1) WHERE id = $2`,
      [successorTaskId, id]
    );
    
    await pool.query(
      `UPDATE tasks SET predecessor_ids = array_append(predecessor_ids, $1) WHERE id = $2`,
      [id, successorTaskId]
    );
    
    res.status(201).json(result.rows[0] || { message: 'Dependency already exists' });
  } catch (error) {
    console.error('Error adding task dependency:', error);
    res.status(500).json({ error: 'Failed to add task dependency' });
  }
}

// Remove task dependency
export async function removeTaskDependency(req, res) {
  try {
    const { id, dependencyId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM task_dependencies WHERE id = $1 RETURNING *',
      [dependencyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependency not found' });
    }
    
    // Remove from predecessor/successor arrays
    const { predecessor_task_id, successor_task_id } = result.rows[0];
    
    await pool.query(
      `UPDATE tasks SET successor_ids = array_remove(successor_ids, $1) WHERE id = $2`,
      [successor_task_id, predecessor_task_id]
    );
    
    await pool.query(
      `UPDATE tasks SET predecessor_ids = array_remove(predecessor_ids, $1) WHERE id = $2`,
      [predecessor_task_id, successor_task_id]
    );
    
    res.json({ message: 'Dependency removed successfully' });
  } catch (error) {
    console.error('Error removing task dependency:', error);
    res.status(500).json({ error: 'Failed to remove task dependency' });
  }
}

// Update task dependencies (bulk update of predecessor/successor arrays)
export async function updateTaskDependencies(req, res) {
  try {
    const { id } = req.params;
    const { predecessorIds, successorIds } = req.body;
    
    const result = await pool.query(
      `UPDATE tasks
       SET predecessor_ids = COALESCE($1, predecessor_ids),
           successor_ids = COALESCE($2, successor_ids),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [predecessorIds, successorIds, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task dependencies:', error);
    res.status(500).json({ error: 'Failed to update task dependencies' });
  }
}
