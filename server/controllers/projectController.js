import { pool } from '../server.js';

// Get all projects
export async function getAllProjects(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// Get single project with categories and tasks
export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectResult.rows[0];
    
    // Fetch categories
    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE project_id = $1 ORDER BY position',
      [id]
    );
    
    // Fetch tasks for all categories
    const categories = categoriesResult.rows;
    for (const category of categories) {
      const tasksResult = await pool.query(
        `SELECT t.*, 
                COALESCE(td.predecessor_ids, '{}') as predecessors,
                COALESCE(td.successor_ids, '{}') as successors
         FROM tasks t
         LEFT JOIN (
           SELECT predecessor_task_id as task_id, 
                  array_agg(successor_task_id) as successor_ids
           FROM task_dependencies 
           GROUP BY predecessor_task_id
         ) td ON t.id = td.task_id
         WHERE t.category_id = $1 
         ORDER BY t.position`,
        [category.id]
      );
      category.tasks = tasksResult.rows;
    }
    
    project.categories = categories;
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

// Create new project
export async function createProject(req, res) {
  try {
    const { name, description, startDate, endDate, status, color } = req.body;
    
    const result = await pool.query(
      `INSERT INTO projects (name, description, start_date, end_date, status, color)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, startDate, endDate, status, color]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

// Update project
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, color } = req.body;
    
    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           status = COALESCE($5, status),
           color = COALESCE($6, color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, description, startDate, endDate, status, color, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

// Delete project
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

// Get project members
export async function getProjectMembers(req, res) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT pm.*, u.name, u.email, u.avatar_url
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ error: 'Failed to fetch project members' });
  }
}

// Add member to project
export async function addProjectMember(req, res) {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [id, userId, role || 'member']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ error: 'Failed to add project member' });
  }
}

// Remove member from project
export async function removeProjectMember(req, res) {
  try {
    const { id, userId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    res.status(500).json({ error: 'Failed to remove project member' });
  }
}
